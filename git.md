# Formato de Commits

## Standard: Conventional Commits

Este proyecto utiliza el estándar [Conventional Commits](https://www.conventionalcommits.org/) con validación automática mediante **commitlint** y hooks de **Husky**.

## Formato General

```
<type>: <description>
```

- **type**: Tipo de cambio (obligatorio, minúscula)
- **description**: Descripción breve en español, sin punto al final (obligatorio, max 100 caracteres)

## Tipos Permitidos

| Tipo       | Descripción                             |
| ---------- | --------------------------------------- |
| `feat`     | Nueva feature                           |
| `fix`      | Bug fix                                 |
| `refactor` | Refactoring sin cambio de funcionalidad |
| `chore`    | Tareas de mantenimiento                 |
| `docs`     | Solo documentación                      |
| `test`     | Agregar o modificar tests               |
| `perf`     | Mejoras de performance                  |
| `build`    | Cambios en el build                     |
| `ci`       | Cambios en CI/CD                        |

## Ejemplos

```bash
feat: agregar componente de autenticación
fix: corregir redirección en login
refactor: simplificar servicio de productos
docs: actualizar guía de contribución
test: agregar tests para el hook useAuth
chore: actualizar dependencias
```

## Reglas de Validación (commitlint)

Configurado en `commitlint.config.js`:

- **type-enum**: El tipo debe ser uno de los permitidos (`feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`, `build`, `ci`)
- **type-case**: Siempre en minúscula
- **type-empty**: Prohibido dejar el tipo vacío
- **subject-case**: Prohibido usar start-case, pascal-case o upper-case en la descripción
- **subject-empty**: Prohibido dejar la descripción vacía
- **subject-full-stop**: Prohibido usar punto al final de la descripción
- **header-max-length**: Máximo 100 caracteres en el encabezado
- **body-leading-blank**: Debe haber línea en blanco antes del body
- **footer-leading-blank**: Debe haber línea en blanco antes del footer

## Estructura Avanzada (opcional)

Para commits más complejos se puede usar:

```
<type>: <short summary>

<body>

<footer>
```

### Ejemplo con body y footer:

```bash
feat: agregar sistema de filtros para productos

- Agregar componente FilterPanel
- Implementar lógica de filtrado por categoría
- Actualizar API para soportar query params

Closes #42
```

## Commits Atómicos

Cada commit debe representar un único cambio lógico. Separar cambios distintos en commits individuales:

```bash
# ✅ Correcto
feat: add product search input
feat: implement product search logic
test: add product search tests

# ❌ Incorrecto
feat: add product search and filters and details
```

## Hooks Configurados

### Pre-commit

- Ejecuta `npm run lint-staged` (eslint + prettier en archivos staged)

### Commit-msg

- Ejecuta `npx commitlint --edit` para validar el formato del mensaje
- Si la validación falla, el commit se bloquea

## Naming de Branches

```bash
feature/nombre-feature    # Features
fix/nombre-issue          # Bug fixes
hotfix/nombre-critico     # Hotfixes
refactor/nombre-modulo    # Refactoring
```

## Merging

- **Estrategia preferida**: Squash and Merge
- **Alternativa**: Rebase and Merge
- **Requisitos para merge**: Al menos 1 approval, tests pasan, lint sin errores, build exitoso
