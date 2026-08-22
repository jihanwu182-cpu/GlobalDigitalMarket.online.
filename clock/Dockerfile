FROM python:3.11-slim

WORKDIR /app

COPY clock/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY clock/ .

EXPOSE 5000

CMD ["python", "run.py"]
