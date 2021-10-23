FROM python:3.7-alpine
WORKDIR /code
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
#RUN apk add --no-cache gcc musl-dev linux-headers
RUN apk add zlib-dev jpeg-dev gcc musl-dev
#RUN apk update \
#    && apk add --virtual build-deps gcc python3-dev musl-dev \
#    && apk add postgresql \
#    && apk add postgresql-dev \
#    && pip install psycopg2 \
#    && apk add jpeg-dev zlib-dev libjpeg \
#    && pip install Pillow \
#    && apk del build-deps
RUN apk add zbar-dev --update-cache --repository \
    http://dl-3.alpinelinux.org/alpine/edge/testing/ --allow-untrusted
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
EXPOSE 5000
COPY . .
CMD ["flask", "run"]