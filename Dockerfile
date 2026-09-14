# ---------- Stage 1: Build ----------
FROM node:20-alpine AS build

WORKDIR /app

# بنسخ package files لوحدهم الأول عشان Docker يعمل cache للطبقة دي (نفس فكرة
# requirements.txt في الباك اند)
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Stage 2: Serve ----------
FROM nginx:1.27-alpine

# nginx الرسمية بتقرا أي *.template هنا وتحط النتيجة (بعد استبدال ${BACKEND_URL})
# في /etc/nginx/conf.d/ تلقائي وقت ما الـ container يشتغل — مفيش سكريبت إضافي لازم
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
