package main

import (
	"bytes"
	"fmt"
	"html/template"
	"os"
	"path/filepath"
	"strings"
)

const plantilla = "supabase/templates/confirmacion-registro.html"
const enlaceFicticio = "https://registro.example.invalid/confirmar?ejemplo=sin-credenciales&destino=https%3A%2F%2Foscila.vercel.app%2F"

func renderizar(nombre any, presente bool) ([]byte, error) {
	t, err := template.ParseFiles(plantilla)
	if err != nil {
		return nil, err
	}
	metadatos := map[string]any{}
	if presente {
		metadatos["full_name"] = nombre
	}
	var salida bytes.Buffer
	err = t.Execute(&salida, map[string]any{"Data": metadatos, "ConfirmationURL": enlaceFicticio})
	return salida.Bytes(), err
}

func main() {
	destino := "docs/correo-confirmacion/vistas"
	if err := os.MkdirAll(destino, 0755); err != nil {
		panic(err)
	}
	casos := []struct {
		archivo  string
		nombre   any
		presente bool
	}{
		{"con-nombre", "Ana Milena Pérez", true},
		{"sin-nombre", nil, false},
		{"nombre-no-confiable", `<img src=x onerror="alert(1)"> Ana & "Pérez"`, true},
		{"sin-imagenes", "Ana Milena Pérez", true},
	}
	for _, caso := range casos {
		html, err := renderizar(caso.nombre, caso.presente)
		if err != nil {
			panic(err)
		}
		if caso.archivo == "sin-imagenes" {
			inicio := strings.Index(string(html), "<img ")
			fin := inicio + strings.Index(string(html[inicio:]), ">") + 1
			html = []byte(string(html[:inicio]) + `<span style="font-size:28px; font-weight:bold;">Oscila</span>` + string(html[fin:]))
		}
		ruta := filepath.Join(destino, caso.archivo+".html")
		if err := os.WriteFile(ruta, html, 0644); err != nil {
			panic(err)
		}
		fmt.Println(ruta)
	}
}
