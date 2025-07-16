"""
Generated Manim Script
======================
Prompt: Create a Visualize the complex wave function: Ψ ( 𝑥 , 𝑡 ) = 𝐴 𝑒 𝑖 ( 𝑘 𝑥 − 𝜔 𝑡 ) = 𝐴 ( cos ⁡ ( 𝑘 𝑥 − 𝜔 𝑡 ) + 𝑖 sin ⁡ ( 𝑘 𝑥 − 𝜔 𝑡 ) ) Ψ(x,t)=Ae i(kx−ωt) =A(cos(kx−ωt)+isin(kx−ωt)) Where: 𝐴 A: Amplitude 𝑘 k: Wave number 𝜔 ω: Angular frequency 𝑖 i: Imaginary unit We’ll show: Real part: ℜ [ Ψ ( 𝑥 , 𝑡 ) ] = 𝐴 cos ⁡ ( 𝑘 𝑥 − 𝜔 𝑡 ) ℜ[Ψ(x,t)]=Acos(kx−ωt) Imaginary part: ℑ [ Ψ ( 𝑥 , 𝑡 ) ] = 𝐴 sin ⁡ ( 𝑘 𝑥 − 𝜔 𝑡 ) ℑ[Ψ(x,t)]=Asin(kx−ωt) animation in manim script
Generated: 2025-07-16T13:43:50.206Z
Library: Manim Community Edition

Instructions to run:
1. Install manim: pip install manim
2. Run: manim create_a_visualize_the_complex_2025-07-16T13-43-50-206Z -pql
   
For more information, visit: https://www.manim.community/
"""

from manim import *

class ComplexWaveFunction(Scene):
    def construct(self):
        # Parameters
        A = 1.5  # Amplitude
        k = 2    # Wave number
        omega = 1  # Angular frequency
        
        # Create axes
        axes = Axes(
            x_range=[0, 8, 1],
            y_range=[-2, 2, 1],
            axis_config={"color": BLUE}
        )
        axes_labels = axes.get_axis_labels(x_label="x", y_label="y")
        
        # Time tracker
        time = ValueTracker(0)
        
        # Wave function definitions
        def real_wave(x):
            return A * np.cos(k * x - omega * time.get_value())
            
        def imag_wave(x):
            return A * np.sin(k * x - omega * time.get_value())
            
        # Create graphs
        real_graph = always_redraw(
            lambda: axes.plot(real_wave, color=RED)
        )
        imag_graph = always_redraw(
            lambda: axes.plot(imag_wave, color=GREEN)
        )
        
        # Labels
        real_label = MathTex(r"\Re[\Psi(x,t)] = A\cos(kx - \omega t)").next_to(axes, UP)
        imag_label = MathTex(r"\Im[\Psi(x,t)] = A\sin(kx - \omega t)").next_to(real_label, DOWN)
        
        # Animation sequence
        self.play(Create(axes), Write(axes_labels))
        self.play(Write(real_label), Write(imag_label))
        self.play(Create(real_graph), Create(imag_graph))
        self.play(time.animate.set_value(4*PI), run_time=10, rate_func=linear)
        self.wait()
