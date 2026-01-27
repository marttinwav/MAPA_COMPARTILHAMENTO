import json
import csv
import argparse
from pathlib import Path

def flatten_dict(d, parent_key="", sep="."):
    """Achata dicionários aninhados: {"a":{"b":1}} -> {"a.b":1}"""
    items = {}
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else str(k)
        if isinstance(v, dict):
            items.update(flatten_dict(v, new_key, sep=sep))
        else:
            # Se vier lista, salva como JSON em uma célula
            if isinstance(v, list):
                items[new_key] = json.dumps(v, ensure_ascii=False)
            else:
                items[new_key] = v
    return items

def detect_records(data):
    # Caso 1: lista de dicts (formato esperado atual)
    if isinstance(data, list) and data and all(isinstance(x, dict) for x in data):
        return data

    # Caso 2: lista de listas/tuplas: ["id", lat, lon]
    if isinstance(data, list) and data and all(isinstance(x, (list, tuple)) for x in data):
        # tenta interpretar como [id, lat, lon]
        records = []
        for row in data:
            if len(row) < 3:
                raise ValueError("Linha inválida: esperado [id, lat, lon].")
            records.append({
                "id": row[0],
                "lat": row[1],
                "lon": row[2],
            })
        return records

    raise ValueError("JSON em formato não suportado. Use lista de dicts ou lista [id, lat, lon].")


def json_to_csv(input_json_path, output_csv_path, flatten=True, encoding="utf-8"):
    input_json_path = Path(input_json_path)
    output_csv_path = Path(output_csv_path)

    with input_json_path.open("r", encoding=encoding) as f:
        data = json.load(f)

    records = detect_records(data)

    if flatten:
        rows = [flatten_dict(r) for r in records]
    else:
        rows = records

    # monta cabeçalho com união de todas as chaves
    fieldnames = sorted({k for row in rows for k in row.keys()})

    # newline="" evita linhas em branco no Windows
    with output_csv_path.open("w", encoding=encoding, newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=fieldnames,
            delimiter=",",                 # separado por vírgulas
            quoting=csv.QUOTE_MINIMAL      # coloca aspas quando necessário (vírgula, quebra de linha, aspas)
        )
        writer.writeheader()
        for row in rows:
            writer.writerow({k: row.get(k, "") for k in fieldnames})

def main():
    parser = argparse.ArgumentParser(description="Converte JSON para CSV (separado por vírgulas) e formata as linhas.")
    parser.add_argument("input", help="Caminho do arquivo .json")
    parser.add_argument("-o", "--output", help="Caminho do .csv de saída (padrão: mesmo nome do input).")
    parser.add_argument("--no-flatten", action="store_true", help="Não achatar campos aninhados (dict dentro de dict).")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output) if args.output else input_path.with_suffix(".csv")

    json_to_csv(
        input_json_path=input_path,
        output_csv_path=output_path,
        flatten=not args.no_flatten
    )

    print(f"OK: CSV gerado em: {output_path}")

if __name__ == "__main__":
    main()
