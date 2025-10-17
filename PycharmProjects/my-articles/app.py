from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import re
import os

# --- App Initialization ---
app = Flask(__name__)
app.config['SECRET_KEY'] = 'a_very_secret_key_that_is_long_and_secure'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'


# --- Database Models ---
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)


class Article(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(150), unique=True, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    html_content = db.Column(db.Text, nullable=False)


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


def sanitize_slug(title):
    """Generates a URL-friendly slug from a title."""
    title = title.strip().lower()
    title = re.sub(r'[^a-z0-9_\- ]+', '', title)
    title = title.replace(" ", "-")
    return title


# --- Public Routes ---
@app.route('/')
def home():
    """Show list of all article."""
    articles = Article.query.order_by(Article.id.desc()).all()
    return render_template('index.html', articles=articles)


@app.route('/article/<slug>')
def article(slug):
    """Render a single article."""
    article = Article.query.filter_by(slug=slug).first_or_404()
    return render_template('article.html', article=article)


# --- Admin Authentication Routes ---
@app.route('/login', methods=['GET', 'POST'])
def login():
    """Admin login page."""
    if current_user.is_authenticated:
        return redirect(url_for('home'))

    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password, password):
            login_user(user)
            flash('Logged in successfully!', 'success')
            return redirect(url_for('home'))
        else:
            flash('Invalid username or password.', 'error')

    return render_template('login.html')


@app.route('/logout')
@login_required
def logout():
    """Logs the admin out."""
    logout_user()
    flash('You have been logged out.', 'success')
    return redirect(url_for('home'))


# --- Admin-Only Article Management Routes ---
@app.route('/upload', methods=['GET', 'POST'])
@login_required
def upload():
    """Upload a new article."""
    if request.method == 'POST':
        title = request.form.get('title', '').strip()
        html_code = request.form.get('html_code', '').strip()

        if not title or not html_code:
            flash("Both title and HTML content are required.", "error")
            return redirect(url_for('upload'))

        slug = sanitize_slug(title)
        if Article.query.filter_by(slug=slug).first():
            flash(f"An article with the title '{title}' already exists. Please choose a different title.", "error")
            return redirect(url_for('upload'))

        new_article = Article(title=title, html_content=html_code, slug=slug)
        db.session.add(new_article)
        db.session.commit()

        flash(f"✅ Article '{title}' uploaded successfully!", "success")
        return redirect(url_for('home'))

    return render_template('upload.html')


@app.route('/edit/<slug>', methods=['GET', 'POST'])
@login_required
def edit_article(slug):
    """Edit an existing article."""
    article = Article.query.filter_by(slug=slug).first_or_404()

    if request.method == 'POST':
        article.title = request.form.get('title', '').strip()
        article.html_content = request.form.get('html_code', '').strip()
        article.slug = sanitize_slug(article.title)

        if not article.title or not article.html_content:
            flash("Title and HTML content cannot be empty.", "error")
            return render_template('edit.html', article=article)

        db.session.commit()
        flash(f"✅ Article '{article.title}' updated successfully!", "success")
        return redirect(url_for('article', slug=article.slug))

    return render_template('edit.html', article=article)


@app.route('/delete/<slug>', methods=['POST'])
@login_required
def delete_article(slug):
    """Delete an article."""
    article_to_delete = Article.query.filter_by(slug=slug).first_or_404()

    try:
        db.session.delete(article_to_delete)
        db.session.commit()
        flash(f"🗑️ Article '{article_to_delete.title}' deleted successfully!", "success")
    except Exception as e:
        flash(f"❌ Failed to delete article: {e}", "error")

    return redirect(url_for('home'))


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Create a default admin user if one doesn't exist
        if not User.query.filter_by(username='admin').first():
            hashed_password = generate_password_hash('admin_password', method='pbkdf2:sha256')
            admin_user = User(username='admin', password=hashed_password)
            db.session.add(admin_user)
            db.session.commit()
            print("Admin user created with username 'admin' and password 'admin_password'.")
            print("Please change this password immediately in a production environment.")
    app.run(debug=True)