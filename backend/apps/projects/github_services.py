import requests


GITHUB_API_BASE_URL = "https://api.github.com"


def fetch_github_profile(username):

    url = (
        f"{GITHUB_API_BASE_URL}/users/{username}"
    )

    response = requests.get(url)

    if response.status_code != 200:
        return None

    return response.json()


def fetch_github_repositories(username):

    url = (
        f"{GITHUB_API_BASE_URL}/users/"
        f"{username}/repos"
    )

    response = requests.get(url)

    if response.status_code != 200:
        return []

    return response.json()