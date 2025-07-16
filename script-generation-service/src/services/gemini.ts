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
- NEVER use Unicode characters directly in LaTeX - use LaTeX commands instead:
  - Use \\Psi instead of Ψ (Greek Psi)
  - Use \\omega instead of ω (Greek omega)
  - Use \\alpha instead of α (Greek alpha)
  - Use \\beta instead of β (Greek beta)
  - Use \\gamma instead of γ (Greek gamma)
  - Use \\delta instead of δ (Greek delta)
  - Use \\theta instead of θ (Greek theta)
  - Use \\lambda instead of λ (Greek lambda)
  - Use \\mu instead of μ (Greek mu)
  - Use \\nu instead of ν (Greek nu)
  - Use \\pi instead of π (Greek pi)
  - Use \\rho instead of ρ (Greek rho)
  - Use \\sigma instead of σ (Greek sigma)
  - Use \\tau instead of τ (Greek tau)
  - Use \\phi instead of φ (Greek phi)
  - Use \\chi instead of χ (Greek chi)
  - Use \\infty instead of ∞ (infinity)
  - Use \\pm instead of ± (plus-minus)
  - Use \\times instead of × (multiplication)
  - Use \\div instead of ÷ (division)
  - Use \\leq instead of ≤ (less than or equal)
  - Use \\geq instead of ≥ (greater than or equal)
  - Use \\neq instead of ≠ (not equal)
  - Use \\approx instead of ≈ (approximately equal)
  - Use \\subset instead of ⊂ (subset)
  - Use \\supset instead of ⊃ (superset)
  - Use \\in instead of ∈ (element of)
  - Use \\notin instead of ∉ (not element of)
  - Use \\cap instead of ∩ (intersection)
  - Use \\cup instead of ∪ (union)
  - Use \\int instead of ∫ (integral)
  - Use \\sum instead of ∑ (summation)
  - Use \\prod instead of ∏ (product)
  - Use \\partial instead of ∂ (partial derivative)
  - Use \\nabla instead of ∇ (gradient)
  - Use \\hbar instead of ℏ (reduced Planck constant)
  - Use \\Re instead of ℜ (real part)
  - Use \\Im instead of ℑ (imaginary part)

CRITICAL PYTHON/MANIM RULES:
- When creating lists of MathTex objects, access them with [0], [1], [2], etc.
- NEVER use .get_left(), .get_center(), .get_right() on lists
- Only use .get_left(), .get_center(), .get_right() on individual MathTex objects
- Use VGroup(*list_name) to group list elements, then animate the VGroup
- For individual elements from lists, use list_name[0], list_name[1], etc.
- MODERN MANIM SYNTAX: Use .animate for transformations in self.play()
- CORRECT: self.play(triangle.animate.set_color(YELLOW))
- WRONG: self.play(triangle.set_color, YELLOW)
- CORRECT: self.play(text.animate.move_to(UP))
- WRONG: self.play(text.move_to, UP)

SAFE PRACTICES:
- Create individual MathTex objects for each mathematical symbol/term
- Use .next_to() or .move_to() for positioning instead of manual coordinates when possible
- When using lists: access with [index], when using individual objects: use .get_methods()
- NEVER reference self.time without defining it first as a ValueTracker
- NEVER use always_redraw() without ensuring all referenced attributes exist
- Always initialize any custom attributes in the construct() method before using them
- NEVER assign to function calls (func() = value is invalid Python syntax)
- Use == for comparisons, = for assignments
- NEVER assign to method calls like obj.method() = value

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

# CORRECT - Time-based animation with ValueTracker
self.time = ValueTracker(0)  # Initialize BEFORE using
graph = always_redraw(
    lambda: axes.plot(lambda x: np.sin(x + self.time.get_value()), color=BLUE)
)
self.add(graph)
self.play(self.time.animate.set_value(2*PI), run_time=4)
\`\`\`

WRONG EXAMPLES:
\`\`\`python
# WRONG - Don't use get_methods on lists
formula_parts = [MathTex("x ="), MathTex("\\frac{-b}{2a}")]
formula_parts.get_left()  # WRONG! This will cause AttributeError

# WRONG - Incomplete LaTeX
MathTex(r"\\frac{-b")  # WRONG! Missing closing brace and denominator

# WRONG - Using self.time without defining it
graph = always_redraw(
    lambda: axes.plot(lambda x: np.sin(x + self.time), color=BLUE)  # WRONG! self.time not defined
)

# WRONG - Using always_redraw without ValueTracker
self.time = 0  # WRONG! Should be ValueTracker(0)
graph = always_redraw(
    lambda: axes.plot(lambda x: np.sin(x + self.time), color=BLUE)  # WRONG! Can't animate plain numbers
)

# WRONG - Invalid Python syntax (assigning to function call)
my_function() = 5  # WRONG! This is invalid Python syntax
obj.method() = value  # WRONG! Cannot assign to method calls

# WRONG - Using = instead of == in conditions
if x = 5:  # WRONG! Should be ==
    pass
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
    script = fixManimSyntaxErrors(script);
    script = fixAnimationErrors(script);
    script = fixSyntaxErrors(script);
    script = fixUnicodeCharacters(script);

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

// Function to fix Manim syntax errors - convert old syntax to new animate syntax
function fixManimSyntaxErrors(script: string): string {
  let fixedScript = script;
  
  // Fix old self.play syntax with method calls
  // Pattern: self.play(object.method, arg1, arg2, ...)
  // Replace with: self.play(object.animate.method(arg1, arg2, ...))
  
  // Common methods that need to be converted
  const methodsToFix = [
    'set_color', 'move_to', 'shift', 'scale', 'rotate', 'set_opacity',
    'set_fill', 'set_stroke', 'set_width', 'set_height', 'to_edge',
    'to_corner', 'next_to', 'align_to', 'center', 'match_x', 'match_y'
  ];
  
  methodsToFix.forEach(method => {
    // Pattern: self.play(object.method, args...)
    const oldPattern = new RegExp(
      `self\\.play\\(\\s*([\\w\\.\\[\\]]+)\\.${method}\\s*,\\s*([^)]+)\\)`,
      'g'
    );
    
    fixedScript = fixedScript.replace(oldPattern, (match, object, args) => {
      // Clean up args - remove trailing commas and whitespace
      const cleanArgs = args.trim().replace(/,$/, '');
      return `self.play(${object}.animate.${method}(${cleanArgs}))`;
    });
    
    // Pattern: self.play(object.method) - no arguments
    const oldPatternNoArgs = new RegExp(
      `self\\.play\\(\\s*([\\w\\.\\[\\]]+)\\.${method}\\s*\\)`,
      'g'
    );
    
    fixedScript = fixedScript.replace(oldPatternNoArgs, (match, object) => {
      return `self.play(${object}.animate.${method}())`;
    });
  });
  
  // Handle multi-argument self.play calls (multiple objects being animated)
  // Pattern: self.play(obj1.method, arg1, obj2.method, arg2, ...)
  fixedScript = fixedScript.replace(
    /self\.play\(\s*([^)]+)\s*\)/g,
    (match, content) => {
      // Split by commas but be careful about nested parentheses
      const parts = [];
      let currentPart = '';
      let parenCount = 0;
      
      for (let i = 0; i < content.length; i++) {
        const char = content[i];
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
        
        if (char === ',' && parenCount === 0) {
          parts.push(currentPart.trim());
          currentPart = '';
        } else {
          currentPart += char;
        }
      }
      if (currentPart.trim()) {
        parts.push(currentPart.trim());
      }
      
      // Convert each part if it looks like old syntax
      const convertedParts = [];
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        
        // Check if this looks like object.method followed by arguments
        const methodMatch = part.match(/^([\\w\\.\\[\\]]+)\\.(\\w+)$/);
        if (methodMatch && methodsToFix.includes(methodMatch[2])) {
          // This is a method call, next parts might be its arguments
          const [, object, method] = methodMatch;
          const args = [];
          
          // Collect arguments until we hit another method call or end
          let j = i + 1;
          while (j < parts.length) {
            const nextPart = parts[j];
            const nextMethodMatch = nextPart.match(/^([\\w\\.\\[\\]]+)\\.(\\w+)$/);
            if (nextMethodMatch && methodsToFix.includes(nextMethodMatch[2])) {
              break; // Found another method call
            }
            args.push(nextPart);
            j++;
          }
          
          // Create the animate version
          if (args.length > 0) {
            convertedParts.push(`${object}.animate.${method}(${args.join(', ')})`);
          } else {
            convertedParts.push(`${object}.animate.${method}()`);
          }
          
          i = j - 1; // Skip the arguments we processed
        } else if (!methodMatch) {
          // This is not a method call, keep as is
          convertedParts.push(part);
        }
      }
      
      if (convertedParts.length > 0) {
        return `self.play(${convertedParts.join(', ')})`;
      }
      
      return match; // Return original if we couldn't parse it
    }
  );
  
  return fixedScript;
}

// Function to fix common animation errors
function fixAnimationErrors(script: string): string {
  let fixedScript = script;
  
  // Check if self.time is used in the script
  if (fixedScript.includes('self.time')) {
    // Find the construct method and check if ValueTracker is initialized early enough
    const constructMatch = fixedScript.match(/(def construct\(self\):\s*)([\s\S]*?)(?=\n\s{0,4}def|\n\s{0,4}class|$)/);
    
    if (constructMatch) {
      const constructMethod = constructMatch[2];
      const usagePattern = /self\.time\.get_value\(\)/;
      const initPattern = /self\.time\s*=\s*ValueTracker\(/;
      
      // Check if self.time is used before being initialized
      const usageMatch = constructMethod.search(usagePattern);
      const initMatch = constructMethod.search(initPattern);
      
      if (usageMatch !== -1 && (initMatch === -1 || usageMatch < initMatch)) {
        // Remove existing ValueTracker initialization if it exists
        if (initMatch !== -1) {
          fixedScript = fixedScript.replace(/\s*self\.time\s*=\s*ValueTracker\([^)]*\)[^\n]*\n?/g, '');
        }
        
        // Add ValueTracker initialization right after construct method definition
        fixedScript = fixedScript.replace(
          /(def construct\(self\):\s*)/,
          '$1\n        # Initialize time tracker for animations\n        self.time = ValueTracker(0)\n'
        );
      } else if (!fixedScript.includes('self.time = ValueTracker')) {
        // Add ValueTracker initialization if it doesn't exist at all
        fixedScript = fixedScript.replace(
          /(def construct\(self\):\s*)/,
          '$1\n        # Initialize time tracker for animations\n        self.time = ValueTracker(0)\n'
        );
      }
    }
  }
  
  // Fix cases where always_redraw uses self.time directly instead of self.time.get_value()
  fixedScript = fixedScript.replace(
    /self\.time(?!\.get_value\(\)|\.animate|\.set_value|\s*=)/g,
    'self.time.get_value()'
  );
  
  // Fix cases where time is used as a plain number in animations
  fixedScript = fixedScript.replace(
    /self\.time\s*=\s*(\d+)/g,
    'self.time = ValueTracker($1)'
  );
  
  return fixedScript;
}

// Function to fix common Python syntax errors
function fixSyntaxErrors(script: string): string {
  let fixedScript = script;
  
  // Fix common assignment errors where functions are assigned instead of called
  // Pattern: function_name() = value (should be variable = function_name())
  fixedScript = fixedScript.replace(
    /(\w+)\(\)\s*=\s*([^=\n]+)/g,
    '$2 = $1()'
  );
  
  // Fix cases where .get_value() is assigned to instead of the tracker
  fixedScript = fixedScript.replace(
    /(\w+)\.get_value\(\)\s*=\s*([^=\n]+)/g,
    '$1.set_value($2)'
  );
  
  // Fix specific ValueTracker syntax errors
  // Pattern: self.time.ValueTracker(0) = get_value() -> self.time = ValueTracker(0)
  fixedScript = fixedScript.replace(
    /self\.time\.ValueTracker\(([^)]+)\)\s*=\s*get_value\(\)/g,
    'self.time = ValueTracker($1)'
  );
  
  // Fix more general ValueTracker assignment errors
  fixedScript = fixedScript.replace(
    /(\w+)\.ValueTracker\(([^)]+)\)\s*=\s*(\w+\(\))/g,
    '$1 = ValueTracker($2)'
  );
  
  // Fix self.time being referenced without initialization
  if (fixedScript.includes('self.time.get_value()') && !fixedScript.includes('self.time = ValueTracker')) {
    // Add initialization after construct method definition
    fixedScript = fixedScript.replace(
      /(def construct\(self\):\s*)/,
      '$1\n        # Initialize time tracker\n        self.time = ValueTracker(0)\n'
    );
  }
  
  // Fix .get_value().animate patterns -> should be just .animate
  fixedScript = fixedScript.replace(
    /(\w+)\.get_value\(\)\.animate\./g,
    '$1.animate.'
  );
  
  // Fix self.time.get_value().animate -> self.time.animate
  fixedScript = fixedScript.replace(
    /self\.time\.get_value\(\)\.animate\./g,
    'self.time.animate.'
  );
  
  // Fix cases where method calls are used in assignment positions
  fixedScript = fixedScript.replace(
    /(\w+\.\w+\([^)]*\))\s*=\s*([^=\n]+)/g,
    (match, methodCall, value) => {
      // Only fix if it looks like a method call that shouldn't be assigned to
      if (methodCall.includes('.animate.') || methodCall.includes('.get_')) {
        return `# Fixed invalid assignment: ${match}`;
      }
      return match;
    }
  );
  
  // Fix comparison operator mistakes (= instead of ==)
  fixedScript = fixedScript.replace(
    /if\s+([^=]+)\s*=\s*([^=\n]+):/g,
    'if $1 == $2:'
  );
  
  // Fix while loop comparison mistakes
  fixedScript = fixedScript.replace(
    /while\s+([^=]+)\s*=\s*([^=\n]+):/g,
    'while $1 == $2:'
  );
  
  return fixedScript;
}

// Validate Manim script syntax
// Function to fix Unicode characters in LaTeX expressions
function fixUnicodeCharacters(script: string): string {
  let fixedScript = script;
  
  // Define Unicode to LaTeX mappings
  const unicodeToLatex: { [key: string]: string } = {
    // Greek letters (lowercase)
    'α': '\\alpha',
    'β': '\\beta',
    'γ': '\\gamma',
    'δ': '\\delta',
    'ε': '\\varepsilon',
    'ζ': '\\zeta',
    'η': '\\eta',
    'θ': '\\theta',
    'ι': '\\iota',
    'κ': '\\kappa',
    'λ': '\\lambda',
    'μ': '\\mu',
    'ν': '\\nu',
    'ξ': '\\xi',
    'ο': 'o',
    'π': '\\pi',
    'ρ': '\\rho',
    'σ': '\\sigma',
    'τ': '\\tau',
    'υ': '\\upsilon',
    'φ': '\\phi',
    'χ': '\\chi',
    'ψ': '\\psi',
    'ω': '\\omega',
    
    // Greek letters (uppercase)
    'Α': 'A',
    'Β': 'B',
    'Γ': '\\Gamma',
    'Δ': '\\Delta',
    'Ε': 'E',
    'Ζ': 'Z',
    'Η': 'H',
    'Θ': '\\Theta',
    'Ι': 'I',
    'Κ': 'K',
    'Λ': '\\Lambda',
    'Μ': 'M',
    'Ν': 'N',
    'Ξ': '\\Xi',
    'Ο': 'O',
    'Π': '\\Pi',
    'Ρ': 'P',
    'Σ': '\\Sigma',
    'Τ': 'T',
    'Υ': '\\Upsilon',
    'Φ': '\\Phi',
    'Χ': 'X',
    'Ψ': '\\Psi',
    'Ω': '\\Omega',
    
    // Mathematical symbols
    '∞': '\\infty',
    '±': '\\pm',
    '∓': '\\mp',
    '×': '\\times',
    '÷': '\\div',
    '≤': '\\leq',
    '≥': '\\geq',
    '≠': '\\neq',
    '≈': '\\approx',
    '≡': '\\equiv',
    '∝': '\\propto',
    '∂': '\\partial',
    '∇': '\\nabla',
    '∆': '\\Delta',
    '∑': '\\sum',
    '∏': '\\prod',
    '∫': '\\int',
    '∮': '\\oint',
    '√': '\\sqrt',
    '∈': '\\in',
    '∉': '\\notin',
    '∋': '\\ni',
    '∌': '\\not\\ni',
    '⊂': '\\subset',
    '⊃': '\\supset',
    '⊆': '\\subseteq',
    '⊇': '\\supseteq',
    '∩': '\\cap',
    '∪': '\\cup',
    '∧': '\\wedge',
    '∨': '\\vee',
    '¬': '\\neg',
    '→': '\\to',
    '←': '\\leftarrow',
    '↔': '\\leftrightarrow',
    '⇒': '\\Rightarrow',
    '⇐': '\\Leftarrow',
    '⇔': '\\Leftrightarrow',
    '∀': '\\forall',
    '∃': '\\exists',
    '∄': '\\nexists',
    '∅': '\\emptyset',
    '∆': '\\triangle',
    '∠': '\\angle',
    '⊥': '\\perp',
    '∥': '\\parallel',
    '∦': '\\nparallel',
    '℘': '\\wp',
    'ℜ': '\\Re',
    'ℑ': '\\Im',
    'ℏ': '\\hbar',
    'ℓ': '\\ell',
    '…': '\\ldots',
    '⋮': '\\vdots',
    '⋯': '\\cdots',
    '⋱': '\\ddots',
    '°': '^\\circ',
    '′': "'",
    '″': "''",
    '‴': "'''",
    '⁰': '^0',
    '¹': '^1',
    '²': '^2',
    '³': '^3',
    '⁴': '^4',
    '⁵': '^5',
    '⁶': '^6',
    '⁷': '^7',
    '⁸': '^8',
    '⁹': '^9',
    '₀': '_0',
    '₁': '_1',
    '₂': '_2',
    '₃': '_3',
    '₄': '_4',
    '₅': '_5',
    '₆': '_6',
    '₇': '_7',
    '₈': '_8',
    '₉': '_9'
  };
  
  // Replace Unicode characters within MathTex and axis labels
  fixedScript = fixedScript.replace(
    /(MathTex\(r?"[^"]*"|Text\([^)]*"|x_label\s*=\s*"[^"]*"|y_label\s*=\s*"[^"]*")/g,
    (match) => {
      let fixed = match;
      
      // Replace each Unicode character with its LaTeX equivalent
      Object.entries(unicodeToLatex).forEach(([unicode, latex]) => {
        // Use global replace to handle multiple occurrences
        fixed = fixed.replace(new RegExp(unicode, 'g'), latex);
      });
      
      return fixed;
    }
  );
  
  // Also fix direct string occurrences that might be in axis labels
  fixedScript = fixedScript.replace(
    /(".*?")/g,
    (match) => {
      let fixed = match;
      
      // Replace each Unicode character with its LaTeX equivalent
      Object.entries(unicodeToLatex).forEach(([unicode, latex]) => {
        fixed = fixed.replace(new RegExp(unicode, 'g'), latex);
      });
      
      return fixed;
    }
  );
  
  return fixedScript;
}

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