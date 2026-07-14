#!/usr/bin/env python3
"""Seed script: creates superadmin + sample content for each pillar."""
import asyncio
from datetime import datetime
from passlib.context import CryptContext
import motor.motor_asyncio
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "quran_hub")
ADMIN_EMAIL = os.getenv("SEED_ADMIN_EMAIL", "admin@quranhub.com")
ADMIN_PASSWORD = os.getenv("SEED_ADMIN_PASSWORD", "Admin@1234")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SAMPLE_CONTENTS = [
    {
        "pillar": "quran",
        "category": "Al-Fatihah",
        "title": "Surah Al-Fatihah – The Opening",
        "slug": "surah-al-fatihah",
        "html_body": """
<div class="quran-entry">
  <h2 class="arabic" dir="rtl" lang="ar">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</h2>
  <p>In the name of Allah, the Entirely Merciful, the Especially Merciful.</p>
  <h2 class="arabic" dir="rtl" lang="ar">الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ</h2>
  <p>All praise is due to Allah, Lord of the worlds.</p>
  <h2 class="arabic" dir="rtl" lang="ar">الرَّحْمَٰنِ الرَّحِيمِ</h2>
  <p>The Entirely Merciful, the Especially Merciful.</p>
  <h2 class="arabic" dir="rtl" lang="ar">مَالِكِ يَوْمِ الدِّينِ</h2>
  <p>Sovereign of the Day of Recompense.</p>
  <h2 class="arabic" dir="rtl" lang="ar">إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ</h2>
  <p>It is You we worship and You we ask for help.</p>
  <h2 class="arabic" dir="rtl" lang="ar">اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ</h2>
  <p>Guide us to the straight path.</p>
  <h2 class="arabic" dir="rtl" lang="ar">صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ</h2>
  <p>The path of those upon whom You have bestowed favor, not of those who have evoked anger or of those who are astray.</p>
</div>
""",
        "tags": ["opening", "prayer", "pillar"],
        "status": "published",
    },
    {
        "pillar": "hadith",
        "category": "Sahih Bukhari",
        "title": "Hadith on Intentions (Niyyah)",
        "slug": "hadith-niyyah-intentions",
        "html_body": """
<div class="hadith-entry">
  <blockquote class="arabic" dir="rtl" lang="ar">
    إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى
  </blockquote>
  <p><strong>Translation:</strong> "Actions are judged by their intentions, and everyone shall have what he intended."</p>
  <p><strong>Source:</strong> Sahih Bukhari, Book 1, Hadith 1</p>
  <p><strong>Narrator:</strong> Umar ibn Al-Khattab (may Allah be pleased with him)</p>
  <p>This hadith is considered one of the foundational principles of Islamic jurisprudence. It emphasizes that the validity and reward of any action depends on the sincerity of intention behind it.</p>
</div>
""",
        "tags": ["intentions", "niyyah", "bukhari", "foundation"],
        "status": "published",
    },
    {
        "pillar": "tafsir",
        "category": "Tafsir Al-Fatihah",
        "title": "Tafsir of Surah Al-Fatihah",
        "slug": "tafsir-al-fatihah",
        "html_body": """
<div class="tafsir-entry">
  <h3>Overview</h3>
  <p>Surah Al-Fatihah (The Opening) is the first surah of the Quran and consists of seven verses. It is also known as Umm al-Quran (Mother of the Quran) and Umm al-Kitab (Mother of the Book).</p>
  <h3>Key Themes</h3>
  <ul>
    <li><strong>Praise of Allah</strong> – The surah opens with comprehensive praise of Allah, affirming His attributes of mercy, sovereignty, and lordship.</li>
    <li><strong>Worship and Seeking Help</strong> – Verse 5 encapsulates the essence of the Muslim's relationship with Allah: exclusive worship and reliance.</li>
    <li><strong>Supplication for Guidance</strong> – The final verses are a prayer for guidance to the straight path—the path of those blessed by Allah.</li>
  </ul>
  <h3>Significance in Prayer</h3>
  <p>Reciting Al-Fatihah is obligatory in every unit (rak'ah) of Islamic prayer. The Prophet ﷺ said: "There is no prayer for whoever does not recite the Opening of the Book." (Bukhari & Muslim)</p>
  <p><em>Related: <a href="/quran/surah-al-fatihah">Surah Al-Fatihah</a></em></p>
</div>
""",
        "tags": ["al-fatihah", "tafsir", "opening surah"],
        "status": "published",
    },
    {
        "pillar": "sirah",
        "category": "Early Life",
        "title": "The Birth and Early Life of the Prophet Muhammad ﷺ",
        "slug": "prophet-birth-early-life",
        "html_body": """
<div class="sirah-entry">
  <h3>Birth</h3>
  <p>The Prophet Muhammad ﷺ was born in Mecca on the 12th of Rabi' al-Awwal, approximately 570 CE — the Year of the Elephant — in the clan of Banu Hashim of the Quraysh tribe.</p>
  <h3>Family Background</h3>
  <p>His father, Abdullah ibn Abd al-Muttalib, died before his birth. His mother, Aminah bint Wahb, cared for him until her death when he was about six years old. He was then raised by his grandfather Abd al-Muttalib, and later by his uncle Abu Talib.</p>
  <h3>Early Character</h3>
  <p>Even before prophethood, Muhammad ﷺ was known among the Meccans as Al-Amin (the Trustworthy) and Al-Sadiq (the Truthful). His character demonstrated exceptional honesty, generosity, and wisdom.</p>
  <h3>Marriage to Khadijah</h3>
  <p>At the age of 25, he married Khadijah bint Khuwaylid, a respected businesswoman who was 40 years old. Their marriage was one of deep love, respect, and partnership. Khadijah was the first to accept Islam.</p>
</div>
""",
        "tags": ["prophet", "birth", "early life", "mecca"],
        "status": "published",
    },
]


async def main():
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
    db = client[MONGO_DB]

    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.contents.create_index("slug", unique=True)
    await db.contents.create_index([("pillar", 1), ("status", 1)])
    await db.contents.create_index([("title", "text"), ("tags", "text")])

    # Upsert superadmin
    existing_admin = await db.users.find_one({"email": ADMIN_EMAIL})
    if existing_admin:
        print(f"Admin already exists: {ADMIN_EMAIL}")
        admin_id = existing_admin["_id"]
    else:
        result = await db.users.insert_one({
            "email": ADMIN_EMAIL,
            "password_hash": pwd_context.hash(ADMIN_PASSWORD),
            "name": "Super Admin",
            "role": "superadmin",
            "created_at": datetime.utcnow(),
        })
        admin_id = result.inserted_id
        print(f"Created superadmin: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")

    # Seed sample contents
    for content in SAMPLE_CONTENTS:
        existing = await db.contents.find_one({"slug": content["slug"]})
        if existing:
            print(f"Content already exists: {content['slug']}")
            continue
        now = datetime.utcnow()
        await db.contents.insert_one({
            **content,
            "author_id": admin_id,
            "cover_image": None,
            "created_at": now,
            "updated_at": now,
            "deleted_at": None,
        })
        print(f"Created content: {content['title']}")

    print("\nSeed complete!")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
