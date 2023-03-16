const db = require('./../db');


const getAllQuestions = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT questions.*, users.username
      FROM questions
      JOIN users ON questions.user_id = users.id
      ORDER BY questions.created_at DESC
    `);
    const questions = result.rows;
    res.render('questions', { req, questions });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};


const getNewQuestionForm = (req, res) => {
  res.render('newQuestion', { req });
};

const createQuestion = async (req, res) => {
  const { title, body } = req.body;
  const userId = req.session.user.id; 

  try {
    await db.query(
      'INSERT INTO questions (user_id, title, body, created_at) VALUES ($1, $2, $3, NOW())',
      [userId, title, body]
    );
    res.redirect('/questions');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};


const getQuestion = async (req, res) => {
  const questionId = req.params.id;
  try {
    const question = await db.query(`
      SELECT questions.*, users.username 
      FROM questions
      JOIN users ON questions.user_id = users.id
      WHERE questions.id = $1
    `, [questionId]);

    // Fetch answers for the question
    const answers = await db.query(`
      SELECT answers.*, users.username
      FROM answers
      JOIN users ON answers.user_id = users.id
      WHERE answers.question_id = $1
    `, [questionId]);

    if (question.rows.length === 0) {
      res.status(404).send("Question not found");
      return;
    }

    const formattedQuestionDate = new Date(question.rows[0].created_at).toLocaleDateString();
    const formattedAnswers = answers.rows.map(answer => ({
      ...answer,
      date: new Date(answer.created_at).toLocaleDateString()
    }));

    res.render("questionDetails", {
      question: {
        ...question.rows[0],
        username: question.rows[0].username,
        date: formattedQuestionDate,
        answers: formattedAnswers,
      },
      currentUser: req.session.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};


const getNewAnswerForm = async (req, res) => {
  const questionId = req.params.id;
  res.render('newAnswer', { req, questionId });
};

const createAnswer = async (req, res) => {
  const questionId = req.params.id;
  const { answer_text } = req.body;
  const userId = req.session.user.id; 

  try {
    await db.query(
      'INSERT INTO answers (question_id, user_id, answer_text, created_at) VALUES ($1, $2, $3, NOW())',
      [questionId, userId, answer_text]
    );
    res.redirect(`/questions/${questionId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};


const deleteQuestion = async (req, res) => {
  const questionId = req.params.id;
  const currentUserId = req.session.user.id;

  try {
    // Fetch the question from the database
    const questionResult = await db.query('SELECT * FROM questions WHERE id = $1', [questionId]);
    const question = questionResult.rows[0];

    if (!question) {
      res.status(404).send("Question not found");
      return;
    }

    // Checks if the current user is the owner of the question
    if (question.user_id === currentUserId) {
      // Deletesall answers associated with the question
      await db.query('DELETE FROM answers WHERE question_id = $1', [questionId]);

      // Delete the question
      await db.query('DELETE FROM questions WHERE id = $1', [questionId]);
      res.redirect('/questions');
    } else {
      res.status(403).send("Only the user who posted this can delete it");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};


const getEditQuestionForm = async (req, res) => {
  const questionId = req.params.id;
  const userId = req.session.user.id;
  // console.log('User ID from session:', userId);

  try {
    const result = await db.query('SELECT * FROM questions WHERE id = $1 AND user_id = $2', [questionId, userId]);
    const question = result.rows[0];

    if (!question) {
      res.status(404).send('Question not found or you are not authorized to edit this question');
      return;
    }

    res.render('editQuestion', { question });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};


const editQuestion = async (req, res) => {
  const questionId = req.params.id;
  const userId = req.session.user.id;
  const { title, body } = req.body;
  // console.log('User ID:', userId);

  try {
    const result = await db.query('UPDATE questions SET title = $1, body = $2 WHERE id = $3 AND user_id = $4 RETURNING *', [title, body, questionId, userId]);
    const question = result.rows[0];

    if (!question) {
      res.status(404).send('Question not found or you are not authorized to edit this question');
      return;
    }

    res.redirect(`/questions/${questionId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};


module.exports = {
  getAllQuestions,
  getNewQuestionForm,
  createQuestion,
  getQuestion,
  getNewAnswerForm,
  createAnswer,
  deleteQuestion,
  getEditQuestionForm,
  editQuestion,
};

