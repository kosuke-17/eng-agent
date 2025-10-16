/**
 * コード検索Retriever
 */

import { BaseRetriever } from "./base-retriever.js";
import {
  ProcessedQuery,
  SearchStrategy,
  RawSearchResult,
  SearchFilters,
  CodeFile,
  CodeSymbol,
} from "../types/search.js";
import * as fs from "fs";
import * as path from "path";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";

export class CodeRetriever extends BaseRetriever {
  private codebasePath: string;
  
  constructor(codebasePath: string = "./src") {
    super("CodeRetriever", "code");
    this.codebasePath = codebasePath;
  }
  
  async search(
    query: ProcessedQuery,
    strategy: SearchStrategy,
    filters?: SearchFilters
  ): Promise<RawSearchResult[]> {
    try {
      const codeFiles = await this.getCodeFiles(filters);
      const results: RawSearchResult[] = [];
      
      for (const file of codeFiles) {
        try {
          const symbols = this.extractSymbols(file);
          
          for (const symbol of symbols) {
            const score = this.calculateSymbolScore(query, symbol);
            
            if (score > 0.4) { // 閾値
              results.push({
                id: `${file.path}:${symbol.name}:${symbol.line}`,
                source: 'code',
                title: `${symbol.type}: ${symbol.name}`,
                content: symbol.code,
                score,
                location: {
                  filePath: file.path,
                  lineNumber: symbol.line,
                  columnNumber: symbol.column,
                },
                highlights: symbol.docstring ? [symbol.docstring] : undefined,
                metadata: {
                  type: symbol.type,
                  language: file.language,
                  params: symbol.params,
                  returnType: symbol.returnType,
                },
              });
            }
          }
        } catch (error) {
          console.error(`Failed to parse file: ${file.path}`, error);
        }
      }
      
      // スコアでソート
      results.sort((a, b) => b.score - a.score);
      
      return this.applyFilters(results, filters);
    } catch (error) {
      console.error('CodeRetriever error:', error);
      return [];
    }
  }
  
  /**
   * コードファイルを取得
   */
  private async getCodeFiles(filters?: SearchFilters): Promise<CodeFile[]> {
    const codeFiles: CodeFile[] = [];
    
    if (!fs.existsSync(this.codebasePath)) {
      return codeFiles;
    }
    
    const files = this.getFilesRecursively(this.codebasePath);
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const stats = fs.statSync(file);
        const ext = path.extname(file);
        
        let language: CodeFile['language'] = 'other';
        if (['.ts', '.tsx'].includes(ext)) language = 'typescript';
        else if (['.js', '.jsx'].includes(ext)) language = 'javascript';
        else if (ext === '.py') language = 'python';
        else if (ext === '.java') language = 'java';
        else if (ext === '.go') language = 'go';
        else if (ext === '.rs') language = 'rust';
        
        if (language !== 'other') {
          codeFiles.push({
            path: file,
            content,
            language,
            size: stats.size,
            lastModified: stats.mtime,
          });
        }
      } catch (error) {
        console.error(`Failed to load code file: ${file}`, error);
      }
    }
    
    return codeFiles;
  }
  
  /**
   * コードからシンボルを抽出
   */
  private extractSymbols(file: CodeFile): CodeSymbol[] {
    const symbols: CodeSymbol[] = [];
    
    // TypeScript/JavaScriptのみサポート（初期実装）
    if (!['typescript', 'javascript'].includes(file.language)) {
      return symbols;
    }
    
    try {
      const ast = parser.parse(file.content, {
        sourceType: "module",
        plugins: [
          "typescript",
          "jsx",
          "decorators-legacy",
        ],
        errorRecovery: true,
      });
      
      traverse(ast, {
        FunctionDeclaration: (path: any) => {
          if (path.node.id) {
            symbols.push({
              type: 'function',
              name: path.node.id.name,
              code: this.getNodeCode(file.content, path.node),
              line: path.node.loc?.start.line || 0,
              column: path.node.loc?.start.column,
              endLine: path.node.loc?.end.line,
              docstring: this.extractDocstring(path),
              params: this.extractParams(path.node.params),
              returnType: path.node.returnType ? 'unknown' : undefined,
            });
          }
        },
        
        ArrowFunctionExpression: (path: any) => {
          // 変数宣言内のアロー関数を取得
          if (path.parent.type === 'VariableDeclarator' && path.parent.id) {
            symbols.push({
              type: 'function',
              name: path.parent.id.name,
              code: this.getNodeCode(file.content, path.node),
              line: path.node.loc?.start.line || 0,
              column: path.node.loc?.start.column,
              endLine: path.node.loc?.end.line,
              params: this.extractParams(path.node.params),
            });
          }
        },
        
        ClassDeclaration: (path: any) => {
          if (path.node.id) {
            symbols.push({
              type: 'class',
              name: path.node.id.name,
              code: this.getNodeCode(file.content, path.node),
              line: path.node.loc?.start.line || 0,
              column: path.node.loc?.start.column,
              endLine: path.node.loc?.end.line,
              docstring: this.extractDocstring(path),
            });
          }
        },
        
        TSInterfaceDeclaration: (path: any) => {
          if (path.node.id) {
            symbols.push({
              type: 'interface',
              name: path.node.id.name,
              code: this.getNodeCode(file.content, path.node),
              line: path.node.loc?.start.line || 0,
              column: path.node.loc?.start.column,
              endLine: path.node.loc?.end.line,
              docstring: this.extractDocstring(path),
            });
          }
        },
        
        TSTypeAliasDeclaration: (path: any) => {
          if (path.node.id) {
            symbols.push({
              type: 'type',
              name: path.node.id.name,
              code: this.getNodeCode(file.content, path.node),
              line: path.node.loc?.start.line || 0,
              column: path.node.loc?.start.column,
              endLine: path.node.loc?.end.line,
            });
          }
        },
      });
    } catch (error) {
      console.error(`Failed to parse ${file.path}:`, error);
    }
    
    return symbols;
  }
  
  /**
   * ノードからコードを抽出
   */
  private getNodeCode(content: string, node: any): string {
    if (!node.loc) return '';
    
    const lines = content.split('\n');
    const startLine = node.loc.start.line - 1;
    const endLine = node.loc.end.line - 1;
    
    return lines.slice(startLine, endLine + 1).join('\n');
  }
  
  /**
   * ドキュメント文字列を抽出
   */
  private extractDocstring(path: any): string | undefined {
    const comments = path.node.leadingComments;
    if (comments && comments.length > 0) {
      return comments[comments.length - 1].value.trim();
    }
    return undefined;
  }
  
  /**
   * パラメータを抽出
   */
  private extractParams(params: any[]): Array<{ name: string; type?: string }> {
    return params.map(param => ({
      name: param.name || param.left?.name || 'unknown',
      type: param.typeAnnotation ? 'unknown' : undefined,
    }));
  }
  
  /**
   * シンボルのスコアを計算
   */
  private calculateSymbolScore(query: ProcessedQuery, symbol: CodeSymbol): number {
    // 名前との一致
    let score = this.calculateTextScore(query, symbol.name);
    
    // ドキュメント文字列との一致
    if (symbol.docstring) {
      const docScore = this.calculateTextScore(query, symbol.docstring);
      score = Math.max(score, docScore * 0.8);
    }
    
    // コード内容との一致
    const codeScore = this.calculateTextScore(query, symbol.code);
    score = Math.max(score, codeScore * 0.6);
    
    return score;
  }
  
  /**
   * ディレクトリを再帰的に探索
   */
  private getFilesRecursively(dir: string): string[] {
    const files: string[] = [];
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      // node_modules, .git, distなどを除外
      if (['node_modules', '.git', 'dist', 'build', 'coverage'].includes(item)) {
        continue;
      }
      
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.getFilesRecursively(fullPath));
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.go', '.rs'].includes(ext)) {
          files.push(fullPath);
        }
      }
    }
    
    return files;
  }
}
