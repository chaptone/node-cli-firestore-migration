const Promise = require('bluebird')
const admin = require('firebase-admin')
const _ = require('lodash')
const moment = require('moment')
const { getFirebaseSecret } = require('../secret/secret.js')

let adminSDKInit = false
const app = {}

const migration = async (stage, data) => {
  if (!adminSDKInit) {
    app[stage] = admin.initializeApp({ credential: admin.credential.cert(getFirebaseSecret(stage)) })
    adminSDKInit = true
  } else {
    app[stage] = admin.initializeApp({ credential: admin.credential.cert(getFirebaseSecret(stage)) }, getFirebaseSecret(stage).project_id)
  }

  const db = app[stage].firestore()

  const categoryRef = db.collection('uppeople_categories')
  const quizRef = db.collection('uppeople_quizzes')
  const gradingRef = db.collection('uppeople_gradings')

  return Promise.map(data, async sheet => {
    if (sheet.parent && sheet.parent.length) {
      await createParent(categoryRef, sheet.parent)
      console.log(`Migrated parent to ${stage}`)
    }
    if (sheet.category && sheet.category.length) {
      await createCategory(categoryRef, sheet.category)
      console.log(`Migrated category to ${stage}`)
    }
    if (sheet.quiz && sheet.quiz.length) {
      await createQuiz(quizRef, sheet.quiz)
      console.log(`Migrated quiz to ${stage}`)
    }
    if (sheet.grading && sheet.grading.length) {
      await createGrading(gradingRef, sheet.grading)
      console.log(`Migrated grading to ${stage}`)
    }
    if (sheet.faculty && sheet.faculty.length) {
      createFaculty(categoryRef, sheet.faculty)
      console.log(`Migrated faculty to ${stage}`)
    }
    if (sheet.occupation && sheet.occupation.length) {
      createOccupation(categoryRef, sheet.occupation)
      console.log(`Migrated occupation to ${stage}`)
    }
  }, { concurrency: 1} )
}

const createParent = async (categoryRef, data) => {
  const error = 'Can not migrate parent table of undefined id.'
  if (!data.every(d => d.id)) throw new Error(error)
  return Promise.map(data, async d => {
    const id = d.id
    d.is21Skill = d.is21Skill === 'yes'
    d.timestamp = admin.firestore.FieldValue.serverTimestamp()
    return categoryRef.doc(id).update(_.omit(d, 'id'))
  })
}

const createCategory = async (categoryRef, data) => {
  const error = 'Can not migrate category table of undefined id.'
  if (!data.every(d => d.id)) throw new Error(error)
  return Promise.map(data, async d => {
    const id = d.id
    d.is21Skill = d.is21Skill === 'yes'
    d.timestamp = admin.firestore.FieldValue.serverTimestamp()
    return categoryRef.doc(id).update(_.omit(d, 'id'))
  })
}

const createQuiz = async (quizRef, data) => {
  const error = 'Can not migrate quiz table of undefined id.'
  if (!data.every(d => d.id)) throw new Error(error)
  const quiz = data.reduce((result, d) => {
    result.questions[d.id] = d
    return result
  }, { questions: {}, isActive: true, timestamp: admin.firestore.FieldValue.serverTimestamp() })
  return quizRef.doc(moment().format('YYYY-MM-DD')).set(quiz)
}

const createGrading = async (gradingRef, data) => {
  const error = 'Can not migrate grading table of undefined categoryId.'
  if (!data.every(d => d.categoryId)) throw new Error(error)
  const grading = data.reduce((result, d) => {
    result.categories[d.categoryId] = _.omit(d, 'categoryId')
    return result
  }, { categories: {}, quizId: moment().format('YYYY-MM-DD'), isActive: true, timestamp: admin.firestore.FieldValue.serverTimestamp() })
  return gradingRef.doc(moment().format('YYYY-MM-DD')).set(grading)
}

const createFaculty = async (categoryRef, data) => {
  const error = 'Can not migrate faculty table of undefined categoryId.'
  if (!data.every(d => d.categoryId)) throw new Error(error)
  const groupedFac = _.reduce(_.groupBy(data, 'categoryId'), (r, v, k) => r.concat([v]), [])
  return Promise.map(groupedFac, async f => {
    const id = f[0].categoryId
    const faculty = f.map(fa => _.omit(fa, 'categoryId'))
    return categoryRef.doc(id).update({ factory_relations: faculty })
  })
}

const createOccupation = async (categoryRef, data) => {
  const error = 'Can not migrate faculty table of undefined categoryId.'
  if (!data.every(d => d.categoryId)) throw new Error(error)
  const groupedOcc = _.reduce(_.groupBy(data, 'categoryId'), (r, v, k) => r.concat([v]), [])
  return Promise.map(groupedOcc, async o => {
    const id = o[0].categoryId
    const occupation = o.map(oc => _.omit(oc, 'categoryId'))
    return categoryRef.doc(id).update({ occupation_relations: occupation })
  })
}

module.exports = migration
