"""
Generated Manim Script
======================
Prompt: Create a Visualize the sine wave animation in manim script
Generated: 2025-07-16T13:28:59.566Z
Library: Manim Community Edition

Instructions to run:
1. Install manim: pip install manim
2. Run: manim create_a_visualize_the_sine_wa_2025-07-16T13-28-59-566Z -pql
   
For more information, visit: https://www.manim.community/
"""

from manim import *

class SineWaveVisualization(Scene):
    def construct(self):
        # Create axes
        axes = Axes(
            x_range=[0, 2*PI, PI/2],
            y_range=[-1.5, 1.5, 0.5],
            axis_config={"color": BLUE},
            x_axis_config={
                "numbers_to_include": [0, PI/2, PI, 3*PI/2, 2*PI],
                "numbers_with_elongated_ticks": [0, PI, 2*PI],
            },
            y_axis_config={
                "numbers_to_include": [-1, 0, 1],
            },
        )
        axes_labels = axes.get_axis_labels(
            x_label=MathTex(r"x"), y_label=MathTex(r"\sin(x)")
        )

        # Title
        title = Tex("Sine Wave Visualization", font_size=36)
        title.to_edge(UP)

        # Create sine function
        def sine_func(x):
            return np.sin(x)

        # Create graph
        graph = axes.plot(sine_func, color=GREEN)

        # Create moving dot
        dot = Dot(color=RED).move_to(axes.c2p(0, sine_func(0)))
        dot.add_updater(lambda m: m.move_to(
            axes.c2p(self.time.get_value(), sine_func(self.time.get_value()))
        ))

        # Create vertical line
        line = always_redraw(lambda: DashedLine(
            axes.c2p(self.time.get_value(), 0),
            axes.c2p(self.time.get_value(), sine_func(self.time.get_value())),
            color=YELLOW
        ))

        # Animation
        self.play(Write(title))
        self.wait(0.5)
        self.play(Create(axes), Write(axes_labels))
        self.wait(0.5)
        self.play(Create(graph))
        self.wait(0.5)

        # Initialize time tracker
        self.time = ValueTracker(0)
        self.add(dot, line)
        self.play(self.time.animate.set_value(2*PI),
            run_time=6,
            rate_func=linear
        )
        self.wait(2)

        # Show equation
        equation = MathTex(r"\sin(x)").next_to(graph, UP, buff=0.5)
        self.play(Write(equation))
        self.wait(2)
