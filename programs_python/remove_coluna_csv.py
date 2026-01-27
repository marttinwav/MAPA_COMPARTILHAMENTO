# remove_coluna_csv.py
import csv
import argparse
from pathlib import Path


def remover_coluna_csv(input_csv: Path, coluna: str, output_csv: Path | None, inplace: bool) -> None:
    if not input_csv.exists():
        raise FileNotFoundError(f"Arquivo não encontrado: {input_csv}")

    if inplace and output_csv is not None:
        raise ValueError("Use apenas --inplace OU --output, não os dois.")

    # Se não passar output e não for inplace, cria um nome padrão
    if output_csv is None and not inplace:
        output_csv = input_csv.with_name(input_csv.stem + "_sem_coluna.csv")

    # Caminho temporário quando for inplace
    temp_path = input_csv.with_suffix(".tmp") if inplace else output_csv

    with input_csv.open("r", newline="", encoding="utf-8") as f_in:
        reader = csv.DictReader(f_in, delimiter=",")
        if reader.fieldnames is None:
            raise ValueError("Não foi possível ler o cabeçalho (header) do CSV.")

        if coluna not in reader.fieldnames:
            raise ValueError(
                f"Coluna '{coluna}' não existe. Colunas disponíveis: {', '.join(reader.fieldnames)}"
            )

        novas_colunas = [c for c in reader.fieldnames if c != coluna]

        with Path(temp_path).open("w", newline="", encoding="utf-8") as f_out:
            writer = csv.DictWriter(f_out, fieldnames=novas_colunas, delimiter=",")
            writer.writeheader()

            for row in reader:
                row.pop(coluna, None)  # remove a coluna
                writer.writerow({c: row.get(c, "") for c in novas_colunas})

    if inplace:
        Path(temp_path).replace(input_csv)
        print(f"✅ Coluna '{coluna}' removida com sucesso (arquivo sobrescrito): {input_csv}")
    else:
        print(f"✅ Coluna '{coluna}' removida com sucesso: {output_csv}")


def main():
    parser = argparse.ArgumentParser(description="Remove uma coluna de um arquivo CSV (separado por vírgulas).")
    parser.add_argument("input", help="Caminho do arquivo .csv de entrada")
    parser.add_argument("coluna", help="Nome da coluna a remover (exatamente como no header)")
    parser.add_argument("-o", "--output", help="Caminho do CSV de saída (opcional)")
    parser.add_argument("--inplace", action="store_true", help="Sobrescreve o próprio arquivo de entrada")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output) if args.output else None

    remover_coluna_csv(input_path, args.coluna, output_path, args.inplace)


if __name__ == "__main__":
    main()

