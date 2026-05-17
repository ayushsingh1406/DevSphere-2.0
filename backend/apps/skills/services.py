from .models import UserSkill


PROFICIENCY_SCORES = {
    "BEGINNER": 10,
    "INTERMEDIATE": 25,
    "ADVANCED": 50,
}


def calculate_depth_score(user):

    user_skills = UserSkill.objects.filter(
        user=user
    )

    total_score = 0

    for user_skill in user_skills:

        proficiency_score = PROFICIENCY_SCORES.get(
            user_skill.proficiency,
            0
        )

        experience_score = (
            user_skill.years_of_experience * 5
        )

        project_score = (
            user_skill.projects_completed * 10
        )

        total_score += (
            proficiency_score
            + experience_score
            + project_score
        )

    return total_score