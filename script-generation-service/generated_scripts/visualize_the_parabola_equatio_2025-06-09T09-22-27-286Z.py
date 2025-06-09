"""
Generated Manim Script
======================
Prompt: Visualize the Parabola equation
Generated: 2025-06-09T09:22:27.287Z
Library: Manim Community Edition

Instructions to run:
1. Install manim: pip install manim
2. Run: manim visualize_the_parabola_equatio_2025-06-09T09-22-27-287Z -pql
   
For more information, visit: https://www.manim.community/
"""

from manim import *

class ParabolaEquation(Scene):
    def construct(self):
        title = Text("Parabola Equation", font_size=48)
        self.play(Write(title))
        self.wait(1)

        equation = MathTex(r"y = ax^2 + bx + c")
        self.play(Transform(title, equation))
        self.wait(1)

        explanation = Text("where 'a', 'b', and 'c' are constants.")
        explanation.next_to(equation, DOWN, buff=0.5)
        self.play(Write(explanation))
        self.wait(1)

        graph_axes = Axes(
            x_range=[-5, 5, 1],
            y_range=[-5, 15, 5],
            axis_config={"include_numbers": True}
        )

        parabola1 = graph_axes.plot(lambda x: x**2, x_range=[-3, 3], color=BLUE)
        parabola2 = graph_axes.plot(lambda x: 0.5*x**2 - 2*x + 1, x_range=[-3, 5], color=GREEN)
        parabola3 = graph_axes.plot(lambda x: -x**2 + 3, x_range=[-3, 3], color=RED)

        self.play(Create(graph_axes))
        self.play(Create(parabola1))
        self.wait(1)
        self.play(Create(parabola2))
        self.wait(1)
        self.play(Create(parabola3))
        self.wait(2)

        a_explanation = Text("a > 0: Parabola opens upwards")
        a_explanation.to_edge(UP)
        b_explanation = Text("a < 0: Parabola opens downwards")
        b_explanation.next_to(a_explanation, DOWN)
        self.play(Write(a_explanation), Write(b_explanation))
        self.wait(2)
