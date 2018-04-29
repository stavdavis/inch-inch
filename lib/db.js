var host = process.env.DATABASE_URL || 'postgres://@localhost:5432',
  when = require('when'),
  pg = require('pg'),
  _ = require('underscore');

var connection = when.promise(function(resolve, reject) {
  var client = new pg.Client(host);
  client.connect(function(err) {
    if (err) {
      console.log('db connection error', err);
      reject(err);
      return;
    }

    resolve(client);
  });
});

function getKeyword(keyword) {
  return connection.then(function(client) {
    return when.promise(function(resolve, reject) {
      client.query('SELECT id, word FROM keyword WHERE word = $1', [keyword], function(err, result) {
        if (err) reject(err);
        else if (result.rowCount === 0) resolve(null);
        else resolve(result.rows[0]);
      });
    });
  });
}

function addKeyword(keyword) {
  return connection.then(function(client) {
    return when.promise(function(resolve, reject) {
      client.query('INSERT INTO keyword (word) VALUES ($1) RETURNING id', [keyword], function(err, result) {
        if (err) reject(err);
        else resolve(result.rows[0].id);
      });
    });
  });
}

function addKeywordToTemplate(keywordId, templateId) {
  return connection.then(function(client) {
    return when.promise(function(resolve, reject) {
      client.query(
        'INSERT INTO template_keyword (keyword_id, template_id) VALUES ($1, $2) RETURNING id',
        [keywordId, templateId],
        function(err, result) {
          if (err) reject(err);
          else resolve(result.rows[0].id);
        }
      );
    });
  });
}

function createTemplate(name, justify, pattern, css, paddingLeft, paddingRight, paddingTop, paddingBottom,
  proportionsHorizontal, proportionsVertical, removePunctuation, removeAuthor, filters, misc) {
  return connection.then(function(client) {
    return when.promise(function(resolve, reject) {
      client.query(
        'INSERT INTO template (name, justify, pattern, css, padding_left, padding_right, padding_top, padding_bottom,' +
        ' proportions_horizontal, proportions_vertical, remove_punctuation, remove_author, filters, misc)' +
        ' VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id',
        [
          name, justify, pattern, css, paddingLeft, paddingRight, paddingTop, paddingBottom, proportionsHorizontal,
          proportionsVertical, removePunctuation, removeAuthor, filters, misc
        ],
        function(err, result) {
          if (err) reject(err);
          else resolve(result.rows[0].id);
        }
      );
    });
  });
}

function updateTemplate(templateId, justify, pattern, css, paddingLeft, paddingRight, paddingTop, paddingBottom,
  proportionsHorizontal, proportionsVertical, removePunctuation, removeAuthor, filters, misc) {
  return connection.then(function(client) {
    return when.promise(function(resolve, reject) {
      client.query(
        'UPDATE template SET (justify, pattern, css, padding_left, padding_right, padding_top, padding_bottom,' +
        ' proportions_horizontal, proportions_vertical, remove_punctuation, remove_author, filters, misc)' +
        ' = ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) WHERE id = $14',
        [
          justify, pattern, css, paddingLeft, paddingRight, paddingTop, paddingBottom, proportionsHorizontal,
          proportionsVertical, removePunctuation, removeAuthor, filters, misc, templateId
        ],
        function(err) {
          if (err) reject(err);
          else resolve(true);
        }
      );
    });
  });
}

function renameTemplate(templateId, name) {
  return connection.then(function(client) {
    return when.promise(function(resolve, reject) {
      client.query('UPDATE template SET (name) = ($1) WHERE id = $2', [name, templateId], function(err) {
        if (err) reject(err);
        else resolve(true);
      });
    });
  });
}

function removeKeywordsForTemplate(templateId) {
  return connection.then(function(client) {
    return when.promise(function(resolve, reject) {
      client.query('DELETE FROM template_keyword  WHERE template_id = $1', [templateId], function(err) {
        if (err) reject(err);
        else resolve(true);
      });
    });
  });
}

function getTemplates() {
  return connection.then(function(client) {
    return when.promise(function(resolve, reject) {
      client.query('SELECT id, name FROM template', function(err, result) {
        if (err) reject(err);
        else resolve(result.rows);
      });
    });
  });
}

function getTemplate(templateId) {
  return connection.then(function(client) {
    return when.promise(function(resolve, reject) {
      client.query('SELECT * FROM template WHERE id = $1', [templateId], function(err, result) {
        if (err) reject(err);
        else if (result.rowCount === 0) resolve(null);
        else resolve(result.rows[0]);
      });
    });
  });
}

function getKeywordsForTemplate(templateId) {
  return connection.then(function(client) {
    return when.promise(function(resolve, reject) {
      client.query(
        'SELECT k.id, k.word FROM keyword k INNER JOIN template_keyword tk ON k.id = tk.keyword_id' +
        ' WHERE tk.template_id = $1',
        [templateId],
        function(err, result) {
          if (err) reject(err);
          else resolve(result.rows);
        }
      );
    });
  });
}

function getLongestQuote() {
  return connection.then(function(client) {
    return when.promise(function(resolve, reject) {
      client.query(
        'SELECT q.id, q.text, (SELECT a.name FROM author a WHERE a.id = q.author_id) AS author' +
        ' FROM quote q' +
        ' WHERE length(text) = (select max(length(text)) FROM quote)',
        function(err, result) {
          if (err) reject(err);
          else resolve(result.rows[0]);
        }
      );
    });
  });
}

function getShortestQuote() {
  return connection.then(function(client) {
    return when.promise(function(resolve, reject) {
      client.query(
        'SELECT q.id, q.text, (SELECT a.name FROM author a WHERE a.id = q.author_id) AS author' +
        ' FROM quote q' +
        ' WHERE length(text) = (select min(length(text)) FROM quote)',
        function(err, result) {
          if (err) reject(err);
          else resolve(result.rows[0]);
        }
      );
    });
  });
}

function getRandomQuotes(limit) {
  return connection.then(function(client) {
    return when.promise(function(resolve, reject) {
      client.query(
        'SELECT quote.id, quote.text, quote.parsey, author.name AS author FROM quote INNER JOIN author' +
        ' ON author.id = quote.author_id ORDER BY random() LIMIT $1',
        [limit],
        function(err, result) {
          if (err) reject(err);
          else resolve(result.rows);
        }
      );
    });
  });
}

function getQuote(id) {
  return connection.then(function(client) {
    return when.promise(function(resolve, reject) {
      client.query(
        'SELECT quote.id, quote.text, author.name AS author FROM quote INNER JOIN author' +
        ' ON author.id = quote.author_id WHERE quote.id = $1',
        [id],
        function(err, result) {
          if (err) reject(err);
          else resolve(result.rows[0]);
        }
      );
    });
  });
}

function searchQuotes(params) {
  return connection.then(function(client) {
    return when.promise(function(resolve, reject) {
      var query = 'SELECT q.id, q.text, (SELECT a.name FROM author a WHERE a.id = q.author_id) AS author FROM quote q',
        where = [],
        values = [];
      if (params.text) {
        values.push(params.text);
        where.push(`q.text = $${values.length}`);
      }

      if (params.minCharCount) {
        values.push(params.minCharCount);
        where.push(`q.character_count >= $${values.length}`);
      }

      if (params.maxCharCount) {
        values.push(params.maxCharCount);
        where.push(`q.character_count <= $${values.length}`);
      }

      if (params.minWordCount) {
        values.push(params.minWordCount);
        where.push(`q.word_count >= $${values.length}`);
      }

      if (params.maxWordCount) {
        values.push(params.maxWordCount);
        where.push(`q.word_count <= $${values.length}`);
      }

      if (params.minSentenceCount) {
        values.push(params.minSentenceCount);
        where.push(`q.sentence_count >= $${values.length}`);
      }

      if (params.maxSentenceCount) {
        values.push(params.maxSentenceCount);
        where.push(`q.sentence_count <= $${values.length}`);
      }

      if (params.exclamation) {
        values.push(params.exclamation);
        where.push(`q.contains_exclamation = $${values.length}`);
      }

      if (params.question) {
        values.push(params.question);
        where.push(`q.contains_question = $${values.length}`);
      }

      if (params.hasAuthor) {
        where.push(`q.author_id IS NOT NULL`);
      }

      if (params.firstWords) {
        var firstWords = [];
        _.each(params.firstWords, (firstWord) => {
          values.push(firstWord);
          firstWords.push(`q.first_word = $${values.length}`);
        });
        where.push(`(${firstWords.join(' OR ')})`);
      }

      if (values.length) {
        query += ` WHERE ${where.join(' AND ')}`;
      }

      if (params.limit) {
        query += ` LIMIT ${params.limit}`;
      }

      client.query(
        query,
        values,
        function(err, result) {
          if (err) reject(err);
          else resolve(result.rows);
        }
      );
    });
  });
}

function getQuotes(ids) {
  return connection.then(function(client) {
    return when.promise(function(resolve, reject) {
      client.query(
        'SELECT q.id, q.text, (SELECT a.name FROM author a WHERE q.author_id = a.id) AS author ' +
          ' FROM quote q WHERE q.id = ANY($1::int[])',
        [ids],
        function(err, result) {
          if (err) reject(err);
          else resolve(result.rows);
        }
      );
    });
  });
}

function raw(sql) {
  return connection.then(function(client) {
    return when.promise(function(resolve, reject) {
      client.query(
        sql,
        function(err, result) {
          if (err) reject(err);
          else resolve(result.rows);
        }
      );
    });
  });
}

function getQuoteKeywords(ids) {
  return connection.then(function(client) {
    return when.promise(function(resolve, reject) {
      client.query('SELECT k.id, k.word, k.type, qk.quote_id FROM keyword k INNER JOIN quote_keyword qk' +
        ' ON keyword_id = k.id WHERE quote_id = ANY($1::int[])',
        [ids],
        function(err, result) {
          if (err) reject(err);
          else resolve(result.rows);
        }
      );
    });
  });
}

function searchAuthor(name) {
  return connection.then(function(client) {
    return when.promise(function(resolve, reject) {
      client.query('SELECT a.id FROM author a WHERE a.name = $1',
        [name],
        function(err, result) {
          if (err) reject(err);
          else resolve(result.rows);
        }
      );
    });
  });
}

function createAuthor(name, searchLetter) {
  return connection.then(function(client) {
    return when.promise(function(resolve, reject) {
      client.query('INSERT INTO author (name, search_letter) VALUES ($1, $2) RETURNING id',
        [name, searchLetter],
        function(err, result) {
          if (err) reject(err);
          else resolve(result.rows[0].id);
        }
      );
    });
  });
}

function createQuote(text, authorId) {
  return connection.then(function(client) {
    return when.promise(function(resolve, reject) {
      client.query('INSERT INTO quote (text, author_id) VALUES ($1, $2) RETURNING id',
        [text, authorId],
        function(err, result) {
          if (err) reject(err);
          else resolve(result.rows[0].id);
        }
      );
    });
  });
}

function createBatch(alias) {
  return connection.then(function(client) {
    return when.promise(function(resolve, reject) {
      client.query('INSERT INTO batch (alias) VALUES ($1) RETURNING id',
        [alias],
        function(err, result) {
          if (err) reject(err);
          else resolve(result.rows[0].id);
        }
      );
    });
  });
}

function addToBatch(batchId, quoteId) {
  return connection.then(function(client) {
    return when.promise(function(resolve, reject) {
      client.query('INSERT INTO batch_quote (batch_id, quote_id) VALUES ($1, $2) RETURNING id',
        [batchId, quoteId],
        function(err, result) {
          if (err) reject(err);
          else resolve(result.rows[0].id);
        }
      );
    });
  });
}

function getQuotesForBatch(batchId) {
  return connection.then(function(client) {
    return when.promise(function(resolve, reject) {
      client.query(
        'SELECT q.id, q.text, (SELECT a.name FROM author a WHERE q.author_id = a.id) AS author ' +
          ' FROM quote q INNER JOIN batch_quote bq ON bq.quote_id = q.id AND bq.batch_id = $1',
        [batchId],
        function(err, result) {
          if (err) reject(err);
          else resolve(result.rows);
        }
      );
    });
  });
}

function getBatch(batchId) {
  return connection.then(function(client) {
    return when.promise(function(resolve, reject) {
      client.query(
        'SELECT b.id, b.alias FROM batch b WHERE b.id = $1',
        [batchId],
        function(err, result) {
          if (err) reject(err);
          else resolve(result.rows[0]);
        }
      );
    }).then((batch) => {
      return when.promise(function(resolve, reject) {
        client.query(
          'SELECT bq.quote_id FROM batch_quote bq WHERE bq.batch_id = $1',
          [batch.id],
          function(err, result) {
            if (err) reject(err);
            else {
              batch.quote_ids = _.pluck(result.rows, 'quote_id');
              resolve(batch);
            }
          }
        );
      });
    });
  });
}

function getAllBatches() {
  return connection.then(function(client) {
    return when.promise(function(resolve, reject) {
      client.query(
        'SELECT b.id, b.alias FROM batch b',
        function(err, result) {
          if (err) reject(err);
          else resolve(result.rows);
        }
      );
    });
  });
}

module.exports = {
  createTemplate: createTemplate,
  addKeywordToTemplate: addKeywordToTemplate,
  getKeyword: getKeyword,
  addKeyword: addKeyword,
  removeKeywordsForTemplate: removeKeywordsForTemplate,
  updateTemplate: updateTemplate,
  renameTemplate: renameTemplate,
  getTemplates: getTemplates,
  getTemplate: getTemplate,
  getKeywordsForTemplate: getKeywordsForTemplate,
  getLongestQuote: getLongestQuote,
  getShortestQuote: getShortestQuote,
  getRandomQuotes: getRandomQuotes,
  getQuote: getQuote,
  getQuotes,
  getQuoteKeywords,
  searchQuotes,
  searchAuthor,
  createAuthor,
  createQuote,
  createBatch,
  addToBatch,
  getQuotesForBatch,
  getBatch,
  getAllBatches,
  raw
};
