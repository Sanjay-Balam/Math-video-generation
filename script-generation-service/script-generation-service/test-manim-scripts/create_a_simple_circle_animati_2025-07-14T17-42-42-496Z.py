```python
from manim import *

class GrowShrinkCircle(Scene):
    def construct(self):
        circle = Circle()
        self.play(Create(circle))
        self.play(circle.animate.scale(2))
        self.play(circle.animate.scale(0.5))
        self.wait()
```