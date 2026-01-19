import pandas as pd

arquivo = "Pontos_considerados.csv"

df = pd.read_csv(arquivo)

# adiciona uma nova coluna no final com "vermelho" em todas as linhas
df["cor"] = "preto"

# salva sobrescrevendo o arquivo
df.to_csv(arquivo, index=False)

print("OK! Coluna 'cor' definida como 'preto' para todas as linhas.")
