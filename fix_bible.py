import re
import json

def fix_and_explore():
    path = 'c:/Users/david/Documents/quizz_biblique-/bible_lsg.json'
    with open(path, 'r', encoding='utf-8-sig') as f:
        content = f.read()

    # Quote keys: word followed by colon
    # This is a bit risky but let's try a simple regex for keys
    fixed = re.sub(r'(\w+):', r'"\1":', content)
    
    try:
        data = json.loads(fixed)
        print("Successfully converted to JSON")
        
        # Save fixed version for the web app to use
        with open('c:/Users/david/Documents/quizz_biblique-/bible_lsg_fixed.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False)
        print("Saved bible_lsg_fixed.json")
            
        book_names = []
        for testament in data['Testaments']:
            for book in testament['Books']:
                book_names.append(book.get('Text', 'Unknown'))
        
        print(f"Total Books: {len(book_names)}")
        print("Book names: " + ", ".join(book_names))
        
    except Exception as e:
        print(f"Error: {e}")
        # Print a snippet of where it failed
        if 'char' in str(e):
            pos = int(re.search(r'char (\d+)', str(e)).group(1))
            print(f"Snippet near error: {fixed[max(0, pos-50):pos+50]}")

if __name__ == "__main__":
    fix_and_explore()
