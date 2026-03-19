import numpy as np
from os import getenv
import psycopg
from pgvector.psycopg import register_vector

embeddings_path = "data/recipe_embeddings.npz"
embedding_table_name = 'recipe_embeddings'
db_name = 'meta-foodfinder'

embeddings_table = np.load(embeddings_path, allow_pickle=True)
ids = embeddings_table['rids']
titles = embeddings_table['titles']
embeddings = embeddings_table['embeddings']

conn = psycopg.connect(dbname=getenv('DATABASE', default='foodfinder'), 
                       user=getenv('USERNAME', default='postgres') , 
                       password=getenv('PS_PASSWORD', default='password'),
                       host="127.0.0.1",
                       port=5432,
                       autocommit=True)

conn.execute('CREATE EXTENSION IF NOT EXISTS vector')
register_vector(conn)

conn.execute(f'DROP TABLE IF EXISTS {embedding_table_name}')
dim = embeddings.shape[1]
conn.execute(f'CREATE TABLE recipe_embeddings (id bigserial PRIMARY KEY, embedding vector({dim}))')

for i in range(len(ids)):
    # Making sure the recipe id (with the current embedding) exists in the Recipe table
    res = conn.execute(f'SELECT * FROM recipe where recipe.recipeid = %s', (i,)).fetchall()
    if len(res) == 0:
        continue
    id = ids[i]
    title = titles[i]
    vec = embeddings[i]
    conn.execute(f'INSERT INTO {embedding_table_name} (id, embedding) VALUES (%s, %s)', (id, vec))