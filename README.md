# CodePlayground Pro

Editor HTML, CSS, JavaScript, dan Python dengan live preview.

## Menjalankan backend Python penuh

Backend lokal menjalankan Python asli, sehingga package pada `requirements.txt`
dan library standard seperti `http.server` dapat digunakan. Jalankan dari folder
project:

```bash
python3 backend.py
```

Buka `http://127.0.0.1:8000`. Saat tombol **Python** ditekan, aplikasi mengirim
file Python ke backend. Backend membuat virtual environment lokal di
`.codeplayground-venv`, memasang isi `requirements.txt`, lalu menjalankan file
Python utama dengan batas waktu 30 detik.
Backend sengaja terikat ke `127.0.0.1` dan hanya mengizinkan CORS dari
localhost. Untuk origin lokal tambahan, gunakan environment variable:

```bash
CODEPLAYGROUND_ALLOWED_ORIGINS=http://localhost:5500 python3 backend.py
```

Jangan mengekspos backend ini ke internet: endpoint dapat menjalankan kode
Python dan memasang package dengan `pip`.

Jika backend tidak aktif, aplikasi tetap mencoba menjalankan Python melalui
Pyodide di browser dengan batasan WebAssembly.

## Kelompok Ujian Akhir Semester (UAS)

1. reyshan syah                   https://github.com/reyshansyah-arch
2. Muhammad Ilqi Muzaki           https://github.com/Ilqi63
3. Agung Barlian Saputra          https://github.com/AgungBarlianSaputra1
4. Adjie tegar Alamsyah           https://github.com/Adjietegaralamsyah312
5. Shaula oceano satria muliawan  https://github.com/shaula2526
6. Ahmad Sopandi                  https://github.com/didi355
7. Dimas Aji Saputra              https://github.com/DimasAjiSaputra7
8. Bryan Louis                    https://github.com/bluefire7860
9. Fajar Hidayahtullah            https://github.com/fajarhm22
