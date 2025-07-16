"""
Generated Manim Script
======================
Prompt: Create a Visualize the sine wave animation in manim script
Generated: 2025-07-16T13:17:48.729Z
Library: Manim Community Edition

Instructions to run:
1. Install manim: pip install manim
2. Run: manim create_a_visualize_the_sine_wa_2025-07-16T13-17-48-729Z -pql
   
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
                "numbers_with_elongated_ticks": [0, PI, 2*PI]
            }
        )
        axes_labels = axes.get_axis_labels(x_label="t", y_label="y(t)")
        
        # Create sine function
        sine_graph = axes.plot(lambda x: np.sin(x), color=YELLOW)
        sine_label = MathTex(r"y = \sin(t)", color=YELLOW).next_to(sine_graph, UP, buff=0.3)
        
        # Create moving dot
        moving_dot = Dot().move_to(axes.c2p(0, 0))
        path = TracedPath(moving_dot.get_center, stroke_color=RED)
        
        # Time tracker for animation
        self.time.ValueTracker(0) = get_value()
        
        # Update function for moving dot
        moving_dot.add_updater(lambda m: m.move_to(
            axes.c2p(self.time.get_value(), np.sin(self.time.get_value()))
        ))
        
        # Animation sequence
        self.play(Create(axes), Write(axes_labels))
        self.wait(0.5)
        self.play(Create(sine_graph), Write(sine_label))
        self.wait(0.5)
        self.add(moving_dot, path)
        self.play(self.time.get_value().animate.set_value(2*PI), run_time=8, rate_func=linear)
        self.wait(2)
