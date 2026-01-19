import pandas as pd

arquivo = "pontos.csv"

df = pd.read_csv(arquivo)

# remove duplicadas pelo id (mantém a primeira ocorrência)
df = df.drop_duplicates(subset=["id"], keep="first")

# sobrescreve o próprio arquivo
df.to_csv(arquivo, index=False)

print("Arquivo atualizado! Total de linhas agora:", len(df))
