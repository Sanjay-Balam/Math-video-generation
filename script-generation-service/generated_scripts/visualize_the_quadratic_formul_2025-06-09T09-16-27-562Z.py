"""
Generated Manim Script
======================
Prompt: Visualize the Quadratic Formula
Generated: 2025-06-09T09:16:27.562Z
Library: Manim Community Edition

Instructions to run:
1. Install manim: pip install manim
2. Run: manim visualize_the_quadratic_formul_2025-06-09T09-16-27-562Z -pql
   
For more information, visit: https://www.manim.community/
"""

from manim import *

class QuadraticFormula(Scene):
    def construct(self):
        title = Text("The Quadratic Formula", font_size=48)
        self.play(Write(title))
        self.wait(1)

        equation = MathTex("ax^2 + bx + c = 0")
        self.play(Transform(title, equation))
        self.wait(1)

        formula_parts = [
            MathTex("x ="),
            MathTex("\\frac{-b"),
            MathTex("\\pm"),
            MathTex("\\sqrt{b^2 - 4ac}"),
            MathTex("\\frac{1}{2a}")
        ]

        formula_numerator = VGroup(formula_parts[1], formula_parts[2], formula_parts[3])
        formula_numerator.arrange(RIGHT, buff=0.1)

        formula_fraction = VGroup(formula_numerator, formula_parts[4])
        formula_fraction.arrange(RIGHT, buff=0.1)

        formula = VGroup(formula_parts[0], formula_fraction)
        formula.arrange(RIGHT, buff=0.5)
        formula.next_to(equation, DOWN, buff=1)

        self.play(Write(formula_parts[0]))
        self.play(Write(formula_numerator))
        self.play(Write(formula_parts[4]))
        self.wait(2)
