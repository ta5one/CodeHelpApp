const db = require('./../db');

const getAllQuestions = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM questions ORDER BY created_at DESC');
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
  // console.log(questionId);
  try {
    const question = await db.query(`
      SELECT questions.*, users.username 
      FROM questions
      JOIN users ON questions.user_id = users.id
      WHERE questions.id = $1
    `, [questionId]);
    
    if (question.rows.length === 0) {
      res.status(404).send("Question not found");
      return;
    }

    const formattedDate = new Date(question.rows[0].created_at).toLocaleDateString();
    // console.log(req.session.user)
    res.render("questionDetails", {
      question: {
        ...question.rows[0],
        username: question.rows[0].username,
        date: formattedDate,
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
    const userId = req.session.userId;
    const { answer_text, metadata } = req.body;
  
    try {
      await db.query(
        'INSERT INTO answers (question_id, user_id, answer_text, metadata, created_at) VALUES ($1, $2, $3, $4, NOW())',
        [questionId, userId, answer_text, metadata]
      );
      res.redirect(`/questions/${questionId}`);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  };

  const deleteQuestion = async (req, res) => {
    const questionId = req.params.id;
  
    try {
      // Delete the associated answers first
      await db.query('DELETE FROM answers WHERE question_id = $1', [questionId]);
  
      // Then, delete the question
      await db.query('DELETE FROM questions WHERE id = $1', [questionId]);
  
      res.redirect('/questions');
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
};

