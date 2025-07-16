"""
LaTeX template configuration for Unicode support
"""

import os
import tempfile
from pathlib import Path
from typing import Optional

class UnicodeLatexTemplate:
    """
    Custom LaTeX template that supports Unicode characters
    """
    
    def __init__(self):
        self.template_content = self._get_unicode_template()
    
    def _get_unicode_template(self) -> str:
        """
        Return LaTeX template with Unicode support
        """
        return r"""
\documentclass[preview]{{standalone}}
\usepackage[utf8]{{inputenc}}
\usepackage[T1]{{fontenc}}
\usepackage{{textcomp}}
\usepackage{{lmodern}}
\usepackage[english]{{babel}}
\usepackage{{amsmath}}
\usepackage{{amssymb}}
\usepackage{{amsfonts}}
\usepackage{{mathrsfs}}
\usepackage{{xcolor}}
\usepackage{{xfrac}}
\usepackage{{microtype}}
\usepackage{{mathtools}}
\usepackage{{wasysym}}
\usepackage{{ragged2e}}
\usepackage{{physics}}
\usepackage{{xspace}}
\usepackage{{relsize}}
\usepackage{{textcomp}}
\usepackage{{mathtools}}
\usepackage{{multicol}}
\usepackage{{xstring}}
\usepackage{{cancel}}
\usepackage{{array}}
\usepackage{{centernot}}
\usepackage{{calc}}
\usepackage{{tipa}}
\usepackage{{siunitx}}
\usepackage{{booktabs}}
\usepackage{{upgreek}}
\usepackage{{bm}}
\usepackage{{svg}}
\usepackage{{setspace}}
\usepackage{{fancyhdr}}
\usepackage{{enumerate}}
\usepackage{{listings}}
\usepackage{{fancyvrb}}
\usepackage{{algpseudocode}}
\usepackage{{algorithm}}
\usepackage{{algorithmic}}
\usepackage{{hyperref}}
\usepackage{{graphicx}}
\usepackage{{xcolor}}
\usepackage{{colortbl}}
\usepackage{{lipsum}}
\usepackage{{geometry}}
\usepackage{{setspace}}
\usepackage{{titlesec}}
\usepackage{{titletoc}}
\usepackage{{fancyhdr}}
\usepackage{{lastpage}}
\usepackage{{afterpage}}
\usepackage{{url}}
\usepackage{{pdfpages}}
\usepackage{{pdflscape}}
\usepackage{{afterpage}}
\usepackage{{capt-of}}
\usepackage{{ltxtable}}
\usepackage{{filecontents}}
\usepackage{{tikz}}
\usepackage{{pgfplots}}
\usepackage{{pgfplotstable}}
\usepackage{{adjustbox}}
\usepackage{{makecell}}
\usepackage{{placeins}}
\usepackage{{here}}
\usepackage{{wrapfig}}
\usepackage{{rotating}}
\usepackage{{rotfloat}}
\usepackage{{subfig}}
\usepackage{{subcaption}}
\usepackage{{float}}
\usepackage{{placeins}}
\usepackage{{afterpage}}
\usepackage{{pdflscape}}
\usepackage{{lscape}}
\usepackage{{hvfloat}}
\usepackage{{dpfloat}}
\usepackage{{dblfloatfix}}
\usepackage{{fixltx2e}}
\usepackage{{stfloats}}
\usepackage{{placeins}}
\usepackage{{afterpage}}
\usepackage{{capt-of}}
\usepackage{{ltxtable}}
\usepackage{{filecontents}}
\usepackage{{tikz}}
\usepackage{{pgfplots}}
\usepackage{{pgfplotstable}}
\usepackage{{adjustbox}}
\usepackage{{makecell}}
\usepackage{{placeins}}
\usepackage{{here}}
\usepackage{{wrapfig}}
\usepackage{{rotating}}
\usepackage{{rotfloat}}
\usepackage{{subfig}}
\usepackage{{subcaption}}
\usepackage{{float}}
\usepackage{{placeins}}
\usepackage{{afterpage}}
\usepackage{{pdflscape}}
\usepackage{{lscape}}
\usepackage{{hvfloat}}
\usepackage{{dpfloat}}
\usepackage{{dblfloatfix}}
\usepackage{{fixltx2e}}
\usepackage{{stfloats}}

% Greek letters and symbols
\DeclareUnicodeCharacter{{03A8}}{{\ensuremath{{\Psi}}}}
\DeclareUnicodeCharacter{{03C8}}{{\ensuremath{{\psi}}}}
\DeclareUnicodeCharacter{{03A9}}{{\ensuremath{{\Omega}}}}
\DeclareUnicodeCharacter{{03C9}}{{\ensuremath{{\omega}}}}
\DeclareUnicodeCharacter{{03B1}}{{\ensuremath{{\alpha}}}}
\DeclareUnicodeCharacter{{03B2}}{{\ensuremath{{\beta}}}}
\DeclareUnicodeCharacter{{03B3}}{{\ensuremath{{\gamma}}}}
\DeclareUnicodeCharacter{{03B4}}{{\ensuremath{{\delta}}}}
\DeclareUnicodeCharacter{{03B5}}{{\ensuremath{{\epsilon}}}}
\DeclareUnicodeCharacter{{03B6}}{{\ensuremath{{\zeta}}}}
\DeclareUnicodeCharacter{{03B7}}{{\ensuremath{{\eta}}}}
\DeclareUnicodeCharacter{{03B8}}{{\ensuremath{{\theta}}}}
\DeclareUnicodeCharacter{{03B9}}{{\ensuremath{{\iota}}}}
\DeclareUnicodeCharacter{{03BA}}{{\ensuremath{{\kappa}}}}
\DeclareUnicodeCharacter{{03BB}}{{\ensuremath{{\lambda}}}}
\DeclareUnicodeCharacter{{03BC}}{{\ensuremath{{\mu}}}}
\DeclareUnicodeCharacter{{03BD}}{{\ensuremath{{\nu}}}}
\DeclareUnicodeCharacter{{03BE}}{{\ensuremath{{\xi}}}}
\DeclareUnicodeCharacter{{03BF}}{{\ensuremath{{\omicron}}}}
\DeclareUnicodeCharacter{{03C0}}{{\ensuremath{{\pi}}}}
\DeclareUnicodeCharacter{{03C1}}{{\ensuremath{{\rho}}}}
\DeclareUnicodeCharacter{{03C2}}{{\ensuremath{{\varsigma}}}}
\DeclareUnicodeCharacter{{03C3}}{{\ensuremath{{\sigma}}}}
\DeclareUnicodeCharacter{{03C4}}{{\ensuremath{{\tau}}}}
\DeclareUnicodeCharacter{{03C5}}{{\ensuremath{{\upsilon}}}}
\DeclareUnicodeCharacter{{03C6}}{{\ensuremath{{\phi}}}}
\DeclareUnicodeCharacter{{03C7}}{{\ensuremath{{\chi}}}}

% Capital Greek letters
\DeclareUnicodeCharacter{{0391}}{{\ensuremath{{\Alpha}}}}
\DeclareUnicodeCharacter{{0392}}{{\ensuremath{{\Beta}}}}
\DeclareUnicodeCharacter{{0393}}{{\ensuremath{{\Gamma}}}}
\DeclareUnicodeCharacter{{0394}}{{\ensuremath{{\Delta}}}}
\DeclareUnicodeCharacter{{0395}}{{\ensuremath{{\Epsilon}}}}
\DeclareUnicodeCharacter{{0396}}{{\ensuremath{{\Zeta}}}}
\DeclareUnicodeCharacter{{0397}}{{\ensuremath{{\Eta}}}}
\DeclareUnicodeCharacter{{0398}}{{\ensuremath{{\Theta}}}}
\DeclareUnicodeCharacter{{0399}}{{\ensuremath{{\Iota}}}}
\DeclareUnicodeCharacter{{039A}}{{\ensuremath{{\Kappa}}}}
\DeclareUnicodeCharacter{{039B}}{{\ensuremath{{\Lambda}}}}
\DeclareUnicodeCharacter{{039C}}{{\ensuremath{{\Mu}}}}
\DeclareUnicodeCharacter{{039D}}{{\ensuremath{{\Nu}}}}
\DeclareUnicodeCharacter{{039E}}{{\ensuremath{{\Xi}}}}
\DeclareUnicodeCharacter{{039F}}{{\ensuremath{{\Omicron}}}}
\DeclareUnicodeCharacter{{03A0}}{{\ensuremath{{\Pi}}}}
\DeclareUnicodeCharacter{{03A1}}{{\ensuremath{{\Rho}}}}
\DeclareUnicodeCharacter{{03A3}}{{\ensuremath{{\Sigma}}}}
\DeclareUnicodeCharacter{{03A4}}{{\ensuremath{{\Tau}}}}
\DeclareUnicodeCharacter{{03A5}}{{\ensuremath{{\Upsilon}}}}
\DeclareUnicodeCharacter{{03A6}}{{\ensuremath{{\Phi}}}}
\DeclareUnicodeCharacter{{03A7}}{{\ensuremath{{\Chi}}}}

% Mathematical symbols
\DeclareUnicodeCharacter{{2208}}{{\ensuremath{{\in}}}}
\DeclareUnicodeCharacter{{2209}}{{\ensuremath{{\notin}}}}
\DeclareUnicodeCharacter{{220A}}{{\ensuremath{{\in}}}}
\DeclareUnicodeCharacter{{220B}}{{\ensuremath{{\ni}}}}
\DeclareUnicodeCharacter{{220C}}{{\ensuremath{{\not\ni}}}}
\DeclareUnicodeCharacter{{2211}}{{\ensuremath{{\sum}}}}
\DeclareUnicodeCharacter{{2212}}{{\ensuremath{{-}}}}
\DeclareUnicodeCharacter{{2213}}{{\ensuremath{{\mp}}}}
\DeclareUnicodeCharacter{{2217}}{{\ensuremath{{\ast}}}}
\DeclareUnicodeCharacter{{2218}}{{\ensuremath{{\circ}}}}
\DeclareUnicodeCharacter{{221A}}{{\ensuremath{{\sqrt}}}}
\DeclareUnicodeCharacter{{221E}}{{\ensuremath{{\infty}}}}
\DeclareUnicodeCharacter{{2220}}{{\ensuremath{{\angle}}}}
\DeclareUnicodeCharacter{{2221}}{{\ensuremath{{\measuredangle}}}}
\DeclareUnicodeCharacter{{2222}}{{\ensuremath{{\sphericalangle}}}}
\DeclareUnicodeCharacter{{2223}}{{\ensuremath{{\mid}}}}
\DeclareUnicodeCharacter{{2224}}{{\ensuremath{{\nmid}}}}
\DeclareUnicodeCharacter{{2225}}{{\ensuremath{{\parallel}}}}
\DeclareUnicodeCharacter{{2226}}{{\ensuremath{{\nparallel}}}}
\DeclareUnicodeCharacter{{2227}}{{\ensuremath{{\wedge}}}}
\DeclareUnicodeCharacter{{2228}}{{\ensuremath{{\vee}}}}
\DeclareUnicodeCharacter{{2229}}{{\ensuremath{{\cap}}}}
\DeclareUnicodeCharacter{{222A}}{{\ensuremath{{\cup}}}}
\DeclareUnicodeCharacter{{222B}}{{\ensuremath{{\int}}}}
\DeclareUnicodeCharacter{{222C}}{{\ensuremath{{\iint}}}}
\DeclareUnicodeCharacter{{222D}}{{\ensuremath{{\iiint}}}}
\DeclareUnicodeCharacter{{222E}}{{\ensuremath{{\oint}}}}
\DeclareUnicodeCharacter{{2234}}{{\ensuremath{{\therefore}}}}
\DeclareUnicodeCharacter{{2235}}{{\ensuremath{{\because}}}}
\DeclareUnicodeCharacter{{2236}}{{\ensuremath{{:}}}}
\DeclareUnicodeCharacter{{2237}}{{\ensuremath{{::}}}}
\DeclareUnicodeCharacter{{2238}}{{\ensuremath{{\dot{{-}}}}}}
\DeclareUnicodeCharacter{{223C}}{{\ensuremath{{\sim}}}}
\DeclareUnicodeCharacter{{2243}}{{\ensuremath{{\simeq}}}}
\DeclareUnicodeCharacter{{2245}}{{\ensuremath{{\cong}}}}
\DeclareUnicodeCharacter{{2248}}{{\ensuremath{{\approx}}}}
\DeclareUnicodeCharacter{{2260}}{{\ensuremath{{\neq}}}}
\DeclareUnicodeCharacter{{2261}}{{\ensuremath{{\equiv}}}}
\DeclareUnicodeCharacter{{2264}}{{\ensuremath{{\leq}}}}
\DeclareUnicodeCharacter{{2265}}{{\ensuremath{{\geq}}}}
\DeclareUnicodeCharacter{{2282}}{{\ensuremath{{\subset}}}}
\DeclareUnicodeCharacter{{2283}}{{\ensuremath{{\supset}}}}
\DeclareUnicodeCharacter{{2284}}{{\ensuremath{{\not\subset}}}}
\DeclareUnicodeCharacter{{2285}}{{\ensuremath{{\not\supset}}}}
\DeclareUnicodeCharacter{{2286}}{{\ensuremath{{\subseteq}}}}
\DeclareUnicodeCharacter{{2287}}{{\ensuremath{{\supseteq}}}}
\DeclareUnicodeCharacter{{2295}}{{\ensuremath{{\oplus}}}}
\DeclareUnicodeCharacter{{2297}}{{\ensuremath{{\otimes}}}}
\DeclareUnicodeCharacter{{22A5}}{{\ensuremath{{\perp}}}}
\DeclareUnicodeCharacter{{22C5}}{{\ensuremath{{\cdot}}}}

\begin{{document}}
\begin{{align*}}
{0}
\end{{align*}}
\end{{document}}
"""
    
    def create_temp_config(self) -> str:
        """
        Create a temporary LaTeX configuration file
        """
        with tempfile.NamedTemporaryFile(mode='w', suffix='.tex', delete=False, encoding='utf-8') as f:
            f.write(self.template_content)
            return f.name
    
    def setup_manim_latex_config(self) -> None:
        """
        Set up Manim's LaTeX configuration to use Unicode template
        """
        # Set environment variables that Manim uses for LaTeX
        os.environ['MANIM_TEX_TEMPLATE'] = 'unicode_template'
        
        # Create config directory if it doesn't exist
        config_dir = Path.home() / '.config' / 'manim'
        config_dir.mkdir(parents=True, exist_ok=True)
        
        # Write custom template
        template_file = config_dir / 'unicode_template.tex'
        with open(template_file, 'w', encoding='utf-8') as f:
            f.write(self.template_content)