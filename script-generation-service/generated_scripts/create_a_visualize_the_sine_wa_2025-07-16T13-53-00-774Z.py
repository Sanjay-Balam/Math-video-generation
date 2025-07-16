"""
Generated Manim Script
======================
Prompt: Create a Visualize the sine wave animation in manim script
Generated: 2025-07-16T13:53:00.774Z
Library: Manim Community Edition

Instructions to run:
1. Install manim: pip install manim
2. Run: manim create_a_visualize_the_sine_wa_2025-07-16T13-53-00-774Z -pql
   
For more information, visit: https://www.manim.community/
"""

from manim import *

class SineWaveVisualization(Scene):
    def construct(self):
        # Create axes
        axes = Axes(
            x_range=[-2*PI, 2*PI, PI/2],
            y_range=[-1.5, 1.5, 0.5],
            axis_config={"color": BLUE},
            x_axis_config={
                "numbers_to_include": np.arange(-2*PI, 2.5*PI, PI/2),
                "numbers_with_elongated_ticks": [0, PI, 2*PI, -PI, -2*PI],
            },
            y_axis_config={
                "numbers_to_include": [-1, 0, 1],
            },
        )
        axes_labels = axes.get_axis_labels(x_label="x", y_label="y = \sin(x)")

        # Create title
        title = Tex("Sine Wave Visualization", font_size=36)
        title.to_edge(UP)

        # Create sine function
        def sine_func(x):
            return np.sin(x)

        # Create graph
        graph = axes.plot(sine_func, color=YELLOW)

        # Create moving dot
        moving_dot = Dot(color=RED).move_to(axes.c2p(0, sine_func(0)))
        dot_path = VMobject()
        dot_path.set_points_as_corners([moving_dot.get_center(), moving_dot.get_center() + UP * 0.001])
        dot_path.set_stroke(RED, 2)

        # Animation
        self.play(Write(title))
        self.play(Create(axes), Write(axes_labels))
        self.wait(0.5)
        self.play(Create(graph))
        self.wait(0.5)

        # Add dot and path
        self.add(moving_dot, dot_path)
        self.wait(0.5)

        # Animate dot moving along sine wave
        def update_dot(mob, alpha):
            x = interpolate(-2*PI, 2*PI, alpha)
            y = sine_func(x)
            mob.move_to(axes.c2p(x, y))
            return mob

        def update_path(path):
            previous_path = path.copy()
            previous_path.add_points_as_corners([moving_dot.get_center()])
            path.become(previous_path)

        dot_path.add_updater(update_path)
        self.play(UpdateFromAlphaFunc(moving_dot, update_dot),
            run_time=8,
            rate_func=linear
        )
        dot_path.remove_updater(update_path)
        self.wait(2)

        # Show periodicity
        brace = BraceBetweenPoints(
            axes.c2p(0, -1.2), axes.c2p(2*PI, -1.2),
            color=GREEN, buff=0.2
        )
        period_label = Tex("Period = $2\pi$", font_size=24).next_to(brace, DOWN)
        self.play(GrowFromCenter(brace),
            Write(period_label)
        )
        self.wait(2)
