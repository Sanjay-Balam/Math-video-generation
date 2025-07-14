```python
from manim import *

class SineWaveFromCircle(Scene):
    def construct(self):
        # Create axes
        axes = Axes(
            x_range=[-1, 10, 1],
            y_range=[-2, 2, 1],
            axis_config={"color": BLUE},
        )
        
        # Create a unit circle
        circle = Circle(radius=1, color=WHITE).move_to(axes.c2p(0, 0))
        
        # Create a dot on the circle
        dot = Dot(color=RED).move_to(circle.point_at_angle(0))
        
        # Create a path for the sine wave
        sine_wave = axes.get_graph(lambda x: np.sin(x), color=YELLOW)
        
        # Create a dot that will trace the sine wave
        trace_dot = Dot(color=RED).move_to(axes.c2p(0, 0))
        
        # Function to update the trace dot position
        def update_trace_dot(mob, alpha):
            x = alpha * 2 * PI
            mob.move_to(axes.c2p(x, np.sin(x)))
        
        # Function to update the dot on the circle
        def update_dot(mob, alpha):
            angle = alpha * 2 * PI
            mob.move_to(circle.point_at_angle(angle))
        
        # Add everything to the scene
        self.add(axes, circle, dot, sine_wave, trace_dot)
        
        # Animate the dot and trace dot
        self.play(
            UpdateFromAlphaFunc(dot, update_dot),
            UpdateFromAlphaFunc(trace_dot, update_trace_dot),
            run_time=5,
            rate_func=linear,
        )
        
        self.wait()
```