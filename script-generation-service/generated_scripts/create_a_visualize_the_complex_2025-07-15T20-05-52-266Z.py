"""
Generated Manim Script
======================
Prompt: Create a Visualize the complex wave function: Ψ ( 𝑥 , 𝑡 ) = 𝐴 𝑒 𝑖 ( 𝑘 𝑥 − 𝜔 𝑡 ) = 𝐴 ( cos ⁡ ( 𝑘 𝑥 − 𝜔 𝑡 ) + 𝑖 sin ⁡ ( 𝑘 𝑥 − 𝜔 𝑡 ) ) Ψ(x,t)=Ae i(kx−ωt) =A(cos(kx−ωt)+isin(kx−ωt)) Where: 𝐴 A: Amplitude 𝑘 k: Wave number 𝜔 ω: Angular frequency 𝑖 i: Imaginary unit We’ll show: Real part: ℜ [ Ψ ( 𝑥 , 𝑡 ) ] = 𝐴 cos ⁡ ( 𝑘 𝑥 − 𝜔 𝑡 ) ℜ[Ψ(x,t)]=Acos(kx−ωt) Imaginary part: ℑ [ Ψ ( 𝑥 , 𝑡 ) ] = 𝐴 sin ⁡ ( 𝑘 𝑥 − 𝜔 𝑡 ) ℑ[Ψ(x,t)]=Asin(kx−ωt) animation in manim script
Generated: 2025-07-15T20:05:52.266Z
Library: Manim Community Edition

Instructions to run:
1. Install manim: pip install manim
2. Run: manim create_a_visualize_the_complex_2025-07-15T20-05-52-266Z -pql
   
For more information, visit: https://www.manim.community/
"""

from manim import *
import numpy as np

class ComplexWaveFunction(Scene):
    def construct(self):
        # Parameters
        A = 2.0  # Amplitude
        k = 1.0  # Wave number
        omega = 2.0  # Angular frequency
        
        # Title
        title = Tex("Complex Wave Function: $\\Psi(x,t) = Ae^{i(kx-\\omega t)}$", font_size=36)
        expanded_form = Tex("$= A(\\cos(kx-\\omega t) + i\\sin(kx-\\omega t))$", font_size=36)
        expanded_form.next_to(title, DOWN)
        self.play(Write(title))
        self.wait(1)
        self.play(Write(expanded_form))
        self.wait(2)
        
        # Setup axes
        axes = Axes(
            x_range=[0, 4*PI, PI],
            y_range=[-2.5, 2.5, 1],
            x_length=10,
            y_length=6,
            axis_config={"color": WHITE},
            x_axis_config={
                "numbers_to_include": np.arange(0, 4.1*PI, PI),
                "numbers_with_elongated_ticks": np.arange(0, 4.1*PI, PI),
            },
        )
        axes_labels = axes.get_axis_labels(x_label="x", y_label="y")
        axes_group = VGroup(axes, axes_labels)
        axes_group.to_edge(DOWN)
        
        # Time tracker
        time = ValueTracker(0)
        
        # Real part (cosine)
        real_part = axes.plot(
            lambda x: A * np.cos(k * x - omega * time.get_value()),
            color=RED,
        )
        real_label = Tex("Real part: $\\Re[\\Psi(x,t)] = A\\cos(kx-\\omega t)$", color=RED)
        real_label.next_to(axes_group, UP, buff=0.5)
        
        # Imaginary part (sine)
        imag_part = axes.plot(
            lambda x: A * np.sin(k * x - omega * time.get_value()),
            color=BLUE,
        )
        imag_label = Tex("Imaginary part: $\\Im[\\Psi(x,t)] = A\\sin(kx-\\omega t)$", color=BLUE)
        imag_label.next_to(real_label, UP, buff=0.5)
        
        # Combined complex function
        complex_wave = ParametricFunction(
            lambda t: np.array([
                t,
                A * np.cos(k * t - omega * time.get_value()),
                A * np.sin(k * t - omega * time.get_value()),
            ]),
            t_range=[0, 4*PI],
            color=GREEN
        )
        
        # Add everything to scene
        self.play(FadeOut(title),
            FadeOut(expanded_form),
            Create(axes),
            Write(axes_labels),
            Write(real_label),
            Write(imag_label),
        )
        self.wait(1)
        
        # Animate real and imaginary parts
        real_part.add_updater(
            lambda m: m.become(axes.plot(
                lambda x: A * np.cos(k * x - omega * time.get_value()),
                color=RED,
            ))
        )
        imag_part.add_updater(
            lambda m: m.become(axes.plot(
                lambda x: A * np.sin(k * x - omega * time.get_value()),
                color=BLUE,
            ))
        )
        
        self.add(real_part, imag_part)
        self.play(time.animate.set_value(2*PI), run_time=4, rate_func=linear)
        self.wait(2)
        
        # Show complex plane representation
        complex_plane = ComplexPlane(
            x_range=[-2.5, 2.5],
            y_range=[-2.5, 2.5],
            background_line_style={
                "stroke_color": BLUE_E,
                "stroke_width": 1,
                "stroke_opacity": 0.6
            }
        ).to_edge(RIGHT)
        complex_plane.add_coordinates()
        
        # Moving point showing complex value at x=0
        moving_point = Dot(color=YELLOW).move_to(complex_plane.n2p(complex(0, 0)))
        moving_point.add_updater(
            lambda m: m.move_to(complex_plane.n2p(
                complex(
                    A * np.cos(-omega * time.get_value()),
                    A * np.sin(-omega * time.get_value())
                )
            ))
        )
        
        # Trace path
        trace = TracedPath(moving_point.get_center, dissipating_time=0.5, stroke_color=YELLOW)
        
        self.play(axes_group.animate.scale(0.7).to_edge(LEFT),
            FadeIn(complex_plane),
            FadeIn(moving_point),
        )
        self.add(trace)
        self.play(time.animate.set_value(4*PI), run_time=4, rate_func=linear)
        self.wait(3)
        
        # Show 3D parametric curve
        self.clear()
        axes_3d = ThreeDAxes(
            x_range=[0, 4*PI, PI],
            y_range=[-2.5, 2.5, 1],
            z_range=[-2.5, 2.5, 1],
            x_length=8,
            y_length=6,
            z_length=6,
        )
        axes_3d_labels = axes_3d.get_axis_labels(
            x_label="x", 
            y_label=Tex("$\\Re[\\Psi]$", color=RED), 
            z_label=Tex("$\\Im[\\Psi]$", color=BLUE)
        )
        
        complex_wave_3d = ParametricFunction(
            lambda t: np.array([
                t,
                A * np.cos(k * t - omega * time.get_value()),
                A * np.sin(k * t - omega * time.get_value()),
            ]),
            t_range=[0, 4*PI],
            color=GREEN
        )
        complex_wave_3d.add_updater(
            lambda m: m.become(ParametricFunction(
                lambda t: np.array([
                    t,
                    A * np.cos(k * t - omega * time.get_value()),
                    A * np.sin(k * t - omega * time.get_value()),
                ]),
                t_range=[0, 4*PI],
                color=GREEN
            ))
        )
        
        title_3d = Tex("Complex Wave Function in 3D Space", font_size=36)
        title_3d.to_edge(UP)
        
        self.add(axes_3d, axes_3d_labels, title_3d)
        self.play(Create(complex_wave_3d))
        self.wait(1)
        self.move_camera(phi=75*DEGREES, theta=-45*DEGREES, run_time=3)
        self.play(time.animate.set_value(6*PI), run_time=4, rate_func=linear)
        self.wait(3)
