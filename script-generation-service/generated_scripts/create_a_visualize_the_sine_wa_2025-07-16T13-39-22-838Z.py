"""
Generated Manim Script
======================
Prompt: Create a Visualize the sine wave animation in manim script
Generated: 2025-07-16T13:39:22.838Z
Library: Manim Community Edition

Instructions to run:
1. Install manim: pip install manim
2. Run: manim create_a_visualize_the_sine_wa_2025-07-16T13-39-22-838Z -pql
   
For more information, visit: https://www.manim.community/
"""

from manim import *

class SineWaveAnimation(Scene):
    def construct(self):
        # Create axes
        axes = Axes(
            x_range=[0, 2*PI, PI/2],
            y_range=[-1, 1, 0.5],
            axis_config={"color": BLUE},
        )
        axes_labels = axes.get_axis_labels(x_label="t", y_label="y(t)")
        
        # Title
        title = Text("Sine Wave Visualization", font_size=36)
        title.to_edge(UP)
        
        # Equation
        equation = MathTex(r"y(t) = A\sin(\omega t + \phi)")
        equation.next_to(title, DOWN)
        
        # Create graph
        graph = axes.plot(lambda x: np.sin(x), color=YELLOW)
        graph_label = MathTex(r"\sin(t)").next_to(graph.point_from_proportion(0.5), UR)
        
        # Time tracker
        self.time = ValueTracker(0)
        moving_graph = always_redraw(
            lambda: axes.plot(
                lambda x: np.sin(x + self.time.get_value()),
                color=YELLOW
            )
        )
        
        # Animation sequence
        self.play(Write(title), Write(equation))
        self.wait(0.5)
        self.play(Create(axes), Write(axes_labels))
        self.wait(0.5)
        self.play(Create(graph), Write(graph_label))
        self.add(moving_graph)
        self.wait(0.5)
        self.play(self.time.animate.set_value(2*PI), run_time=4, rate_func=linear)
        self.wait()
