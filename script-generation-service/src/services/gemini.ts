import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateManimScript(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `You are an expert in mathematical visualization and Manim (Mathematical Animation Engine). 
Your task is to generate clean, working Python Manim scripts that create educational mathematical animations.

IMPORTANT GUIDELINES:
1. Always create a class that inherits from Scene
2. Use the construct() method to define the animation
3. Focus on clear, educational visualizations
4. Use appropriate Manim objects like MathTex, Text, NumberPlane, Circle, Square, etc.
5. Include smooth animations with self.play()
6. Add self.wait() for pauses between animations
7. Keep the code clean and well-commented
8. Ensure the script is complete and runnable
9. Use proper imports from manim
10. Make animations engaging and educational

CRITICAL LATEX RULES:
- ALWAYS use complete LaTeX expressions in MathTex
- For fractions: use \\frac{numerator}{denominator} with BOTH parts
- For square roots: use \\sqrt{expression}
- For subscripts: use _{subscript}
- For superscripts: use ^{superscript}
- NEVER leave incomplete LaTeX like \\frac{-b without closing braces
- Always balance your braces { and }

CRITICAL PYTHON/MANIM RULES:
- When creating lists of MathTex objects, access them with [0], [1], [2], etc.
- NEVER use .get_left(), .get_center(), .get_right() on lists
- Only use .get_left(), .get_center(), .get_right() on individual MathTex objects
- Use VGroup(*list_name) to group list elements, then animate the VGroup
- For individual elements from lists, use list_name[0], list_name[1], etc.

SAFE PRACTICES:
- Create individual MathTex objects for each mathematical symbol/term
- Use .next_to() or .move_to() for positioning instead of manual coordinates when possible
- When using lists: access with [index], when using individual objects: use .get_methods()

CORRECT EXAMPLES:
\`\`\`python
# CORRECT - List access
formula_parts = [MathTex("x ="), MathTex("\\frac{-b}{2a}")]
self.play(Write(formula_parts[0]))  # CORRECT
self.play(Write(formula_parts[1]))  # CORRECT

# CORRECT - Individual object methods
equation = MathTex("ax^2 + bx + c = 0")
equation.get_center()  # CORRECT

# CORRECT - VGroup from list
formula = VGroup(*formula_parts)
formula.arrange(RIGHT)
\`\`\`

WRONG EXAMPLES:
\`\`\`python
# WRONG - Don't use get_methods on lists
formula_parts = [MathTex("x ="), MathTex("\\frac{-b}{2a}")]
formula_parts.get_left()  # WRONG! This will cause AttributeError

# WRONG - Incomplete LaTeX
MathTex(r"\\frac{-b")  # WRONG! Missing closing brace and denominator
\`\`\`

EXAMPLE STRUCTURE:
\`\`\`python
from manim import *

class MathAnimation(Scene):
    def construct(self):
        # Title
        title = Text("Mathematical Concept", font_size=48)
        self.play(Write(title))
        self.wait(1)
        
        # Create equation
        equation = MathTex(r"ax^2 + bx + c = 0")
        self.play(Transform(title, equation))
        self.wait(1)
        
        # Create formula parts as list
        formula_parts = [
            MathTex(r"x ="),
            MathTex(r"\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}")
        ]
        
        # Group and position
        formula = VGroup(*formula_parts)
        formula.arrange(RIGHT, buff=0.5)
        formula.next_to(equation, DOWN, buff=1)
        
        # Animate individual parts
        self.play(Write(formula_parts[0]))
        self.play(Write(formula_parts[1]))
        self.wait(2)
\`\`\`

Now generate a Manim script for the following prompt. Return ONLY the Python code, no explanations or markdown formatting:`;

    const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    let script = response.text();

    // Clean up the response to extract only Python code
    script = script.replace(/```python\s*/g, '').replace(/```\s*/g, '');
    script = script.trim();

    // Validate that the script contains basic Manim structure
    if (!script.includes('from manim import') && !script.includes('import manim')) {
      script = `from manim import *\n\n${script}`;
    }

    if (!script.includes('class') || !script.includes('Scene') || !script.includes('construct')) {
      throw new Error('Generated script does not contain valid Manim class structure');
    }

    // Apply fixes (but be much more conservative)
    script = fixLatexSyntaxErrors(script);
    script = fixObviousErrors(script);

    return script;
  } catch (error) {
    console.error('Error generating Manim script:', error);
    throw new Error(`Failed to generate Manim script: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Function to fix LaTeX syntax errors
function fixLatexSyntaxErrors(script: string): string {
  let fixedScript = script;
  
  // Fix MathTex with incomplete LaTeX
  fixedScript = fixedScript.replace(/MathTex\(r"([^"]*?)"\)/g, (match, latexContent) => {
    let fixed = latexContent;
    
    // Count braces to ensure they're balanced
    const openBraces = (fixed.match(/\{/g) || []).length;
    const closeBraces = (fixed.match(/\}/g) || []).length;
    
    // Add missing closing braces
    if (openBraces > closeBraces) {
      const missing = openBraces - closeBraces;
      fixed += '}'.repeat(missing);
    }
    
    // Fix specific incomplete fractions
    if (fixed.includes('\\frac{-b') && !fixed.includes('}{')) {
      fixed = fixed.replace(/\\frac\{-b.*/, '\\\\frac{-b \\\\pm \\\\sqrt{b^2 - 4ac}}{2a}');
    }
    
    // Fix incomplete fractions generally
    fixed = fixed.replace(/\\frac\{([^}]*)\}?(?!\{)/g, (match: string, numerator: string) => {
      if (match.includes('}{')) return match; // Already complete
      return `\\\\frac{${numerator}}{1}`; // Add denominator if missing
    });
    
    return `MathTex(r"${fixed}")`;
  });
  
  return fixedScript;
}

// Function to fix only obvious errors (much more conservative)
function fixObviousErrors(script: string): string {
  let fixedScript = script;
  
  // Only fix very obvious mistakes that we're 100% sure about
  // Fix cases where someone tries to use .get_left() on variables that end with "_parts" or similar
  fixedScript = fixedScript.replace(
    /(\w*parts\w*|\w*list\w*|\w*array\w*)\.get_(left|center|right)\(\)/g,
    (match, varName, method) => {
      // Replace with proper list indexing
      if (method === 'left') return `${varName}[0]`;
      if (method === 'center') return `${varName}[1] if len(${varName}) > 1 else ${varName}[0]`;
      if (method === 'right') return `${varName}[-1]`;
      return match;
    }
  );
  
  return fixedScript;
}

// Validate Manim script syntax
export function validateManimScript(script: string): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic validation checks
  if (!script.includes('from manim import') && !script.includes('import manim')) {
    errors.push('Missing Manim import statement');
  }

  if (!script.includes('class')) {
    errors.push('Missing class definition');
  }

  if (!script.includes('Scene')) {
    errors.push('Class must inherit from Scene');
  }

  if (!script.includes('def construct(self)')) {
    errors.push('Missing construct method');
  }

  // Check for common Manim patterns
  const hasAnimations = script.includes('self.play(') || script.includes('self.add(');
  if (!hasAnimations) {
    errors.push('Script should contain animations (self.play or self.add)');
  }

  // Check for the specific error we just fixed
  if (script.includes('.get_left()') || script.includes('.get_center()') || script.includes('.get_right()')) {
    const lines = script.split('\n');
    for (const line of lines) {
      if ((line.includes('parts') || line.includes('list') || line.includes('array')) && 
          (line.includes('.get_left()') || line.includes('.get_center()') || line.includes('.get_right()'))) {
        errors.push('Attempting to use .get_left/.get_center/.get_right on a list - use [index] instead');
      }
    }
  }

  // Check for incomplete LaTeX fractions
  if (script.includes('\\frac{') && script.includes('MathTex')) {
    const incompletePattern = /\\frac\{[^}]*\}(?!\{)/;
    if (script.match(incompletePattern)) {
      warnings.push('LaTeX syntax was automatically fixed for incomplete fractions');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
} 