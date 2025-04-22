import pandas as pd
from surprise import SVD, Dataset, Reader
from sqlalchemy.orm import Session
from .models import UserPreference, Category

def train_recommendation_model(db: Session):
    """
    Train a recommendation model based on user preferences using scikit surprise.
    """

    preferences = db.query(UserPreference).filter(UserPreference.blacklisted == False).all()

    data = [(pref.user_id, pref.category_id, pref.score) for pref in preferences]
    df = pd.DataFrame(data, columns=['user_id', 'category_id', 'score'])
    reader = Reader(rating_scale=(0, 5))  # Assuming score ranges from 0 to 5

    dataset = Dataset.load_from_df(df[['user_id', 'category_id', 'score']], reader)

    trainset = dataset.build_full_trainset()
    model = SVD()
    model.fit(trainset)

    return model


def recommend_for_user(user_id: int, model, db: Session, num_recommendations: int = 5):
    """
    Recommend categories for a given user based on their clicks, favorites, and blacklists.
    """
    categories = db.query(Category).all()
    predictions = []

    for category in categories:
        pred = model.predict(user_id, category.id)
        predictions.append((category.id, pred.est))

    predictions.sort(key=lambda x: x[1], reverse=True)
    top_recommendations = predictions[:num_recommendations]
    
    return top_recommendations
