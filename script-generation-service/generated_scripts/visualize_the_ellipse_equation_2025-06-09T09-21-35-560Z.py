"""
Generated Manim Script
======================
Prompt: Visualize the Ellipse equation
Generated: 2025-06-09T09:21:35.561Z
Library: Manim Community Edition

Instructions to run:
1. Install manim: pip install manim
2. Run: manim visualize_the_ellipse_equation_2025-06-09T09-21-35-561Z -pql
   
For more information, visit: https://www.manim.community/
"""

from manim import *

class EllipseEquation(Scene):
    def construct(self):
        title = Text("Ellipse Equation", font_size=48)
        self.play(Write(title))
        self.wait(1)

        equation = MathTex(r"\\frac{x^2}{1}}{a^2} + \\frac{y^2}{1}}{b^2} = 1")
        self.play(Transform(title, equation))
        self.wait(1)

        parts = [
            MathTex(r"\\frac{x^2}{1}}{a^2}"),
            MathTex(r"+"),
            MathTex(r"\\frac{y^2}{1}}{b^2}"),
            MathTex(r"= 1")
        ]

        equation_group = VGroup(*parts)
        equation_group.arrange(RIGHT, buff=0.5)
        equation_group.next_to(equation, DOWN, buff=1)

        self.play(Write(parts[0]))
        self.wait(0.5)
        self.play(Write(parts[1]))
        self.wait(0.5)
        self.play(Write(parts[2]))
        self.wait(0.5)
        self.play(Write(parts[3]))
        self.wait(2)

        a_explanation = Text("a: length of semi-major axis").next_to(equation_group, DOWN, buff=1)
        b_explanation = Text("b: length of semi-minor axis").next_to(a_explanation, DOWN, buff=0.5)

        self.play(Write(a_explanation))
        self.play(Write(b_explanation))
        self.wait(3)

        ellipse = Ellipse(width=4, height=2, color=BLUE)
        ellipse.next_to(equation_group, DOWN, buff=2)
        self.play(Create(ellipse))
        self.wait(2)

        a_line = Line(start=ellipse.get_center(), end=ellipse.get_right(), color=RED)
        b_line = Line(start=ellipse.get_center(), end=ellipse.get_top(), color=GREEN)
        
        self.play(Create(a_line))
        self.play(Create(b_line))

        a_label = MathTex("a").next_to(a_line.get_end(), RIGHT)
        b_label = MathTex("b").next_to(b_line.get_end(), UP)

        self.play(Write(a_label))
        self.play(Write(b_label))
        self.wait(3)
