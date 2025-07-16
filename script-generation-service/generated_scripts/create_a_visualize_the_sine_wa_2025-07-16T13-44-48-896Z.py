"""
Generated Manim Script
======================
Prompt: Create a Visualize the sine wave animation in manim script
Generated: 2025-07-16T13:44:48.896Z
Library: Manim Community Edition

Instructions to run:
1. Install manim: pip install manim
2. Run: manim create_a_visualize_the_sine_wa_2025-07-16T13-44-48-896Z -pql
   
For more information, visit: https://www.manim.community/
"""

from manim import *

class SineWaveAnimation(Scene):
    def construct(self):
        # Create axes
        axes = Axes(
            x_range=[-2*PI, 2*PI, PI/2],
            y_range=[-1.5, 1.5, 0.5],
            axis_config={"color": BLUE},
            x_axis_config={
                "numbers_to_include": np.arange(-2*PI, 2.5*PI, PI/2),
                "numbers_with_elongated_ticks": np.arange(-2*PI, 2.5*PI, PI),
            },
        )
        axes_labels = axes.get_axis_labels(x_label="x", y_label="y")

        # Create title
        title = Text("Sine Wave Visualization", font_size=36)
        title.to_edge(UP)

        # Create sine wave equation
        equation = MathTex(r"y = \sin(x)").next_to(title, DOWN)

        # Add axes and labels
        self.play(Write(title), Write(equation), Create(axes), Write(axes_labels))
        self.wait(1)

        # Create sine wave graph
        sine_wave = axes.plot(lambda x: np.sin(x), color=YELLOW)
        wave_label = axes.get_graph_label(sine_wave, label="sin(x)")

        # Animate drawing the wave
        self.play(Create(sine_wave), Write(wave_label))
        self.wait(1)

        # Create moving dot
        dot = Dot().move_to(axes.c2p(0, 0))
        self.play(FadeIn(dot))

        # Animate dot moving along the wave
        self.time = ValueTracker(0)
        dot.add_updater(lambda d: d.move_to(axes.c2p(self.time.get_value(), np.sin(self.time.get_value()))))
        self.add(dot)

        # Animate the wave moving
        sine_wave.add_updater(lambda m: m.become(axes.plot(lambda x: np.sin(x - self.time.get_value()), color=YELLOW)))
        self.play(self.time.animate.set_value(2*PI), run_time=4, rate_func=linear)
        self.wait(2)
