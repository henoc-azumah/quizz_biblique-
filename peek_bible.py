import json

with open('c:/Users/david/Documents/quizz_biblique-/bible_lsg.json', 'r', encoding='utf-8-sig') as f:
    data = json.load(f)

print(f"Keys: {data.keys()}")
print(f"Testaments: {len(data['Testaments'])}")
for t_idx, testament in enumerate(data['Testaments']):
    print(f"Testament {t_idx} name: {testament.get('Text', 'Unknown')}")
    print(f"Books in Testament {t_idx}: {len(testament['Books'])}")
    for b_idx, book in enumerate(testament['Books'][:5]):
        print(f"  Book {b_idx} name: {book.get('Text', 'Unknown')}")
        print(f"  Chapters in Book {b_idx}: {len(book['Chapters'])}")
