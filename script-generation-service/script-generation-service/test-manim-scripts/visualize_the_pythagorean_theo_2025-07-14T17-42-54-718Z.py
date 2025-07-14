```python
from manim import *

class PythagoreanTheorem(Scene):
    def construct(self):
        # Create a right triangle
        triangle = Polygon([-2, -1, 0], [1, -1, 0], [1, 2, 0], color=BLUE)
        self.play(Create(triangle))
        self.wait(1)

        # Label the sides
        a_label = MathTex("a").next_to(triangle.get_bottom(), DOWN)
        b_label = MathTex("b").next_to(triangle.get_right(), RIGHT)
        c_label = MathTex("c").next_to(triangle.get_top(), UP)
        self.play(Write(a_label), Write(b_label), Write(c_label))
        self.wait(1)

        # Create squares on each side
        square_a = Square(side_length=3).next_to(triangle, LEFT)
        square_b = Square(side_length=1).next_to(triangle, DOWN)
        square_c = Square(side_length=3.162).rotate(PI/4).move_to(triangle.get_center() + UP*1.5 + RIGHT*1.5)

        self.play(Create(square_a), Create(square_b), Create(square_c))
        self.wait(1)

        # Show the Pythagorean theorem
        theorem = MathTex("a^2 + b^2 = c^2").to_edge(UP)
        self.play(Write(theorem))
        self.wait(2)
```