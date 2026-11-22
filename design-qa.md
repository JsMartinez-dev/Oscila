# Revisión visual del acceso a Oscila

- La referencia de Stitch está en `referencia/stitch/inicio_sesion/screen.png` y mide 1600 × 1280 píxeles. La captura del usuario mostró el botón de ingreso cortado por el borde inferior de la ventana.
- La captura del navegador integrado «Comprobando que el botón quede visible sin zoom» muestra la portada compacta. La captura incluye el margen del navegador integrado, por lo que las medidas del formulario se tomaron del DOM en píxeles CSS.
- La cabecera, los logotipos y el formulario se redujeron. Se conservan la tipografía Plus Jakarta Sans, los colores, el fondo punteado, los textos y la composición de dos columnas de Stitch.
- En la comprobación final a 1516 × 700 píxeles CSS, los botones de ingreso y registro terminan a 542 y 588 píxeles respectivamente. En ambos estados, la página mide 700 píxeles de alto y encaja sin desplazamiento.
- Se verificaron el registro, el inicio de sesión, el nombre en la cabecera y el cierre de sesión con el servicio de prueba local. La consola del acceso no mostró errores.

final result: passed
