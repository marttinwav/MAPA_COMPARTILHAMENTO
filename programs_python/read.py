import pandas as pd

df = pd.read_csv("pontos.csv")
duplicadas = df[df.duplicated(subset=["id"], keep=False)]
print(duplicadas.sort_values("id"))
