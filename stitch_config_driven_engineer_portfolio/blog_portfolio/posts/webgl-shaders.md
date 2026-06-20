# Understanding WebGL Shaders for Web Design

Creating websites that capture attention instantly requires rich aesthetics and premium visual layout decisions. One of the most effective ways to achieve this is by integrating a subtle, interactive **WebGL Shader background**.

Unlike traditional CSS gradients or canvas animations that run on the CPU (often causing layout thrashing or stuttering), WebGL shaders run directly on the Graphics Processing Unit (GPU), executing thousands of pixel calculations in parallel at a solid 60 FPS.

## 1. What is a Fragment Shader?

In WebGL, rendering is divided into two primary stages:
1.  **Vertex Shader:** Handles coordinates and positions of vertices (e.g. mapping the screen viewport).
2.  **Fragment Shader:** Calculates the color for every individual pixel on the canvas.

For modern web backgrounds, we typically feed the Fragment Shader variables like `u_time` (the current timestamp) and `u_resolution` (the size of the canvas) to construct flowing, animated patterns:

```glsl
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float timeScale = u_time * 0.1;
    
    // Calculate color waves
    float wave = sin(uv.x * 10.0 + timeScale) * cos(uv.y * 10.0 + timeScale);
    vec3 color = vec3(0.05, 0.06, 0.1) + 0.05 * vec3(0.5, 0.6, 1.0) * wave;
    
    gl_FragColor = vec4(color, 1.0);
}
```

## 2. Interactive Mouse Ripple Effects

To make the shader feel alive and responsive, we can also pass the mouse pointer coordinates as a uniform (`u_mouse`):

```glsl
uniform vec2 u_mouse;

// Inside main()
vec2 mousePos = u_mouse / u_resolution;
float dist = distance(uv, mousePos);
float glow = smoothstep(0.15, 0.0, dist) * 0.08;

color += vec3(0.6, 0.7, 1.0) * glow;
```

By adding `glow` directly to the baseline colors, moving the mouse across the page creates a subtle, dynamic illumination trail beneath the text cards that guides the reader's focus.

## 3. Performance Best Practices

To ensure WebGL does not drain mobile battery life or compromise accessibility:

*   **Low Resolution Scale:** Do not sync the drawing buffer 1:1 with high-DPI displays (e.g., Retina displays). Drawing at `0.5x` or `0.75x` resolution and letting CSS upscale the canvas dramatically reduces fragment calculations with almost zero visible loss of quality on a blurred background.
*   **Idle Detection:** Stop the `requestAnimationFrame` render loop if the tab is inactive or if the canvas scrolls out of the viewport.
*   **Subtle Colors:** Use dark base themes (`#0A0A0A` or `#12131A`) and keep glowing accents below `0.1` opacity. This guarantees text readability remains high and passes accessibility guidelines (WCAG).
