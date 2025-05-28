#!/usr/bin/env python3

import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import subprocess
import os

def generate_diagram():
    mermaid_code = code_text.get("1.0", tk.END).strip()
    output_filename = filename_entry.get().strip()
    output_format = format_var.get()
    width = width_entry.get().strip()
    height = height_entry.get().strip()
    bg_color = bg_color_entry.get().strip()

    if not mermaid_code:
        messagebox.showerror("Hata", "Lütfen Mermaid kodunu girin.")
        return
    if not output_filename:
        messagebox.showerror("Hata", "Lütfen bir çıktı dosya adı girin.")
        return

    # Kullanıcının seçtiği dizini al veya varsayılan olarak uygulamanın çalıştığı dizini kullan
    output_dir = output_dir_var.get()
    if not output_dir:
        output_dir = os.getcwd() # Varsayılan olarak uygulamanın çalıştığı dizin

    output_path = os.path.join(output_dir, f"{output_filename}.{output_format}")

    # mmdc komutunu oluştur
    command = [
        "mmdc",
        "-i", "-", # Standard input (stdin) from where mermaid code will be piped
        "-o", output_path
    ]

    if width:
        command.extend(["-w", width])
    if height:
        command.extend(["-H", height]) # -H for height
    if bg_color:
        command.extend(["-b", bg_color])

    try:
        # mmdc komutunu çalıştır ve mermaid kodunu stdin'e gönder
        process = subprocess.run(
            command,
            input=mermaid_code, # Encode code for stdin
            capture_output=True,
            text=True,
            check=True # Raise an exception if the command returns a non-zero exit code
        )
        messagebox.showinfo("Başarılı", f"Diyagram başarıyla oluşturuldu:\n{output_path}\n\nÇıktı:\n{process.stdout}")
    except subprocess.CalledProcessError as e:
        messagebox.showerror("Hata", f"Diyagram oluşturulurken bir hata oluştu:\n{e.stderr}\n\nKomut:\n{' '.join(command)}")
    except FileNotFoundError:
        messagebox.showerror("Hata", "mmdc komutu bulunamadı. Lütfen Mermaid CLI'nin yüklü ve PATH'inizde olduğundan emin olun.")
    except Exception as e:
        messagebox.showerror("Beklenmedik Hata", f"Beklenmedik bir hata oluştu: {e}")

def select_output_directory():
    directory = filedialog.askdirectory()
    if directory:
        output_dir_var.set(directory)

# Ana pencereyi oluştur
root = tk.Tk()
root.title("Mermaid Diyagram Oluşturucu")
root.geometry("600x750")
root.resizable(False, False) # Pencere boyutunun değişmesini engelle

# Stil tanımlamaları
style = ttk.Style()
style.theme_use('clam') # Modern bir tema seçimi (varsayılan: 'alt')
style.configure("TLabel", font=("Arial", 10))
style.configure("TButton", font=("Arial", 10, "bold"), padding=8)
style.configure("TEntry", padding=5)
style.configure("TCombobox", padding=5)

# Çerçeve oluştur (daha iyi düzenleme için)
main_frame = ttk.Frame(root, padding="15 15 15 15")
main_frame.pack(fill=tk.BOTH, expand=True)

# Mermaid Kodu Girişi
ttk.Label(main_frame, text="Mermaid Kodunuz:").grid(row=0, column=0, columnspan=2, sticky=tk.W, pady=(0, 5))
code_text = tk.Text(main_frame, height=10, width=60, font=("Monospace", 10), bd=1, relief="solid")
code_text.grid(row=1, column=0, columnspan=2, pady=(0, 10), sticky=tk.W+tk.E)
code_text.insert(tk.END, "graph TD\n    A[Merhaba] --> B(Dünya)") # Varsayılan kod

# Çıktı Dosya Adı ve Formatı
ttk.Label(main_frame, text="Çıktı Dosya Adı (uzantısız):").grid(row=2, column=0, sticky=tk.W, pady=(0, 5))
filename_entry = ttk.Entry(main_frame, width=30)
filename_entry.grid(row=3, column=0, sticky=tk.W+tk.E, pady=(0, 10))
filename_entry.insert(0, "mermaid_diagram")

ttk.Label(main_frame, text="Çıktı Formatı:").grid(row=2, column=1, sticky=tk.W, pady=(0, 5), padx=(10,0))
format_var = tk.StringVar(root)
format_var.set("png") # Varsayılan değer
format_options = ["png", "jpg", "svg", "pdf"]
format_dropdown = ttk.Combobox(main_frame, textvariable=format_var, values=format_options, state="readonly", width=15)
format_dropdown.grid(row=3, column=1, sticky=tk.W+tk.E, pady=(0, 10), padx=(10,0))

# Genişlik ve Yükseklik
ttk.Label(main_frame, text="Genişlik (piksel, boş bırakırsanız otomatik):").grid(row=4, column=0, sticky=tk.W, pady=(0, 5))
width_entry = ttk.Entry(main_frame, width=30)
width_entry.grid(row=5, column=0, sticky=tk.W+tk.E, pady=(0, 10))

ttk.Label(main_frame, text="Yükseklik (piksel, boş bırakırsanız otomatik):").grid(row=4, column=1, sticky=tk.W, pady=(0, 5), padx=(10,0))
height_entry = ttk.Entry(main_frame, width=30)
height_entry.grid(row=5, column=1, sticky=tk.W+tk.E, pady=(0, 10), padx=(10,0))

# Arka Plan Rengi
ttk.Label(main_frame, text="Arka Plan Rengi (Örn: transparent, #ffffff, red):").grid(row=6, column=0, columnspan=2, sticky=tk.W, pady=(0, 5))
bg_color_entry = ttk.Entry(main_frame, width=60)
bg_color_entry.grid(row=7, column=0, columnspan=2, sticky=tk.W+tk.E, pady=(0, 10))
bg_color_entry.insert(0, "transparent")

# Çıktı Dizini Seçimi
ttk.Label(main_frame, text="Çıktı Dizini:").grid(row=8, column=0, sticky=tk.W, pady=(0, 5))
output_dir_var = tk.StringVar(root)
output_dir_var.set(os.getcwd()) # Varsayılan olarak uygulamanın çalıştığı dizin
output_dir_entry = ttk.Entry(main_frame, textvariable=output_dir_var, width=40, state="readonly")
output_dir_entry.grid(row=9, column=0, sticky=tk.W+tk.E, pady=(0, 10))
select_dir_button = ttk.Button(main_frame, text="Seç", command=select_output_directory)
select_dir_button.grid(row=9, column=1, sticky=tk.W, pady=(0, 10), padx=(10,0))


# Buton
generate_button = ttk.Button(main_frame, text="Diyagram Oluştur", command=generate_diagram)
generate_button.grid(row=10, column=0, columnspan=2, pady=20, sticky=tk.W+tk.E)

# Grid yapılandırması
main_frame.columnconfigure(0, weight=1)
main_frame.columnconfigure(1, weight=1)

# Uygulamayı başlat
root.mainloop()
