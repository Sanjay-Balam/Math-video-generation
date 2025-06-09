import { promises as fs } from 'fs';
import path from 'path';

// Create a directory for generated scripts
const SCRIPTS_DIR = path.join(process.cwd(), 'generated_scripts');

// Ensure the directory exists
async function ensureScriptsDirectory() {
  try {
    await fs.access(SCRIPTS_DIR);
  } catch {
    await fs.mkdir(SCRIPTS_DIR, { recursive: true });
  }
}

// Generate a unique filename based on prompt and timestamp
function generateFilename(prompt: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const sanitizedPrompt = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 30);
  
  return `${sanitizedPrompt}_${timestamp}.py`;
}

// Perfect the Python script formatting
function perfectPythonScript(script: string, prompt: string): string {
  // Add file header with metadata
  const header = `"""
Generated Manim Script
======================
Prompt: ${prompt}
Generated: ${new Date().toISOString()}
Library: Manim Community Edition

Instructions to run:
1. Install manim: pip install manim
2. Run: manim ${generateFilename(prompt).replace('.py', '')} -pql
   
For more information, visit: https://www.manim.community/
"""

`;

  // Ensure proper imports
  let perfectScript = script;
  if (!perfectScript.includes('from manim import')) {
    perfectScript = 'from manim import *\n\n' + perfectScript;
  }

  // Add proper spacing and formatting
  perfectScript = perfectScript
    .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
    .replace(/^(\s*)(#.*)/gm, '$1$2') // Ensure proper comment formatting
    .trim();

  return header + perfectScript + '\n';
}

// Save script to file
export async function saveScriptToFile(script: string, prompt: string): Promise<{
  filename: string;
  filepath: string;
  perfectScript: string;
}> {
  try {
    await ensureScriptsDirectory();
    
    const filename = generateFilename(prompt);
    const filepath = path.join(SCRIPTS_DIR, filename);
    const perfectScript = perfectPythonScript(script, prompt);
    
    await fs.writeFile(filepath, perfectScript, 'utf8');
    
    return {
      filename,
      filepath,
      perfectScript
    };
  } catch (error) {
    throw new Error(`Failed to save script to file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get list of generated scripts
export async function getGeneratedScripts(): Promise<Array<{
  filename: string;
  created: Date;
  size: number;
}>> {
  try {
    await ensureScriptsDirectory();
    const files = await fs.readdir(SCRIPTS_DIR);
    const pythonFiles = files.filter(file => file.endsWith('.py'));
    
    const scriptsInfo = await Promise.all(
      pythonFiles.map(async (filename) => {
        const filepath = path.join(SCRIPTS_DIR, filename);
        const stats = await fs.stat(filepath);
        return {
          filename,
          created: stats.birthtime,
          size: stats.size
        };
      })
    );
    
    return scriptsInfo.sort((a, b) => b.created.getTime() - a.created.getTime());
  } catch (error) {
    throw new Error(`Failed to get scripts list: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Read a specific script file
export async function readScriptFile(filename: string): Promise<string> {
  try {
    const filepath = path.join(SCRIPTS_DIR, filename);
    return await fs.readFile(filepath, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read script file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Delete a script file
export async function deleteScriptFile(filename: string): Promise<void> {
  try {
    const filepath = path.join(SCRIPTS_DIR, filename);
    await fs.unlink(filepath);
  } catch (error) {
    throw new Error(`Failed to delete script file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 