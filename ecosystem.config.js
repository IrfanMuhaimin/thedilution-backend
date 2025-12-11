module.exports = {
  apps : [{
    name   : "thedilution-api",
    script : "./app.js",
    // --- THIS IS THE CRITICAL PART ---
    // We are defining the environment variables directly for PM2
    env: {
      "NODE_ENV": "production",
      "PORT": "8080",
      "DB_HOST": "127.0.0.1",
      "DB_PORT": "3307",
      "DB_USER": "thedilution_user",
      "DB_PASSWORD": "admin123",
      "DB_NAME": "thedilution_db",
      "ROBOT_API_URL": "http://robot.thedilution.my/api",
      "JWT_SECRET": "a_very_strong_and_secret_key_that_no_one_can_guess"
    }
    // ---------------------------------
  }]
}
