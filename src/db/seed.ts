import { pathToFileURL } from 'url'
import { db } from './connection.ts'
import { entries, habits, habitTags, tags, users } from './schema.ts'

const seed = async () => {
  console.log('Starting seed')

  try {
    console.log('Clearing existing data...')
    await db.delete(entries)
    await db.delete(tags)
    await db.delete(habitTags)
    await db.delete(habits)
    await db.delete(users)
    console.log('Data cleared')

    console.log('Seeding data...')
    const [demoUser] = await db
      .insert(users)
      .values([
        {
          email: 'test@test.com',
          username: 'test',
          password: 'test',
          firstName: 'Test',
          lastName: 'User',
        },
      ])
      .returning()

    console.log('Creating tags...')
    const [tag1, tag2] = await db
      .insert(tags)
      .values([
        {
          name: 'Tag 1',
        },
        {
          name: 'Tag 2',
        },
      ])
      .returning()

    console.log('Creating habits...')
    const [habit1, habit2] = await db
      .insert(habits)
      .values([
        {
          name: 'Habit 1',
          userId: demoUser.id,
          frequency: 'daily',
          targetCount: 1,
          isActive: true,
        },
      ])
      .returning()

    await db.insert(habitTags).values([
      {
        habitId: habit1.id,
        tagId: tag1.id,
      },
    ])

    console.log('Seeding completed successfully')

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      await db.insert(entries).values([
        {
          habitId: habit1.id,
          completionData: date,
        },
      ])
    }

    console.log('Seed completed successfully')
    console.log('User:')
    console.log(`Email: ${demoUser.email}`)
    console.log(`Username: ${demoUser.username}`)
    console.log(`First Name: ${demoUser.firstName}`)
    console.log(`Last Name: ${demoUser.lastName}`)
    console.log('Habits:')
    console.log(`Name: ${habit1.name}`)
    console.log(`Frequency: ${habit1.frequency}`)
    console.log(`Target Count: ${habit1.targetCount}`)
    console.log('Tags:')
  } catch (error) {
    console.error('Error seeding data:', error)
    process.exit(1)
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  seed()
    .then(() => process.exit(0))
    .catch((e) => process.exit(1))
}

export default seed
