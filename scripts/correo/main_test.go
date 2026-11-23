package main

import (
	"os"
	"strings"
	"testing"
)

func TestMain(m *testing.M) {
	if err := os.Chdir("../.."); err != nil {
		panic(err)
	}
	os.Exit(m.Run())
}

func TestSaludoYEscape(t *testing.T) {
	casos := []struct {
		nombre   any
		presente bool
		esperado string
	}{
		{"Ana Milena Pérez", true, "Hola, Ana Milena Pérez."},
		{nil, false, "Hola."},
		{"", true, "Hola."},
		{nil, true, "Hola."},
		{`<img src=x onerror="alert(1)"> Ana & "Pérez"`, true, `Hola, &lt;img src=x onerror=&#34;alert(1)&#34;&gt; Ana &amp; &#34;Pérez&#34;.`},
	}
	for _, caso := range casos {
		html, err := renderizar(caso.nombre, caso.presente)
		if err != nil {
			t.Fatal(err)
		}
		if !strings.Contains(string(html), caso.esperado) || strings.Contains(string(html), "<img src=x") {
			t.Fatalf("Saludo o escape incorrecto para %q", caso.nombre)
		}
	}
}

func TestEnlaceSinReconstruccion(t *testing.T) {
	html, err := renderizar("Ana", true)
	if err != nil {
		t.Fatal(err)
	}
	escapado := strings.ReplaceAll(enlaceFicticio, "&", "&amp;")
	if strings.Count(string(html), `href="`+escapado+`"`) != 2 || !strings.Contains(string(html), ">"+escapado+"</a>") {
		t.Fatal("El botón y el enlace visible deben conservar ConfirmationURL y su redirección")
	}
}
