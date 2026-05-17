import requests
from django.conf import settings
from django.core.cache import cache

class GitHubService:
    BASE_URL = "https://api.github.com"

    def __init__(self, username):
        self.username = self._sanitize_username(username)
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "DevSphere-App",
        }
        if hasattr(settings, 'GITHUB_TOKEN') and settings.GITHUB_TOKEN:
            self.headers["Authorization"] = f"Bearer {settings.GITHUB_TOKEN}"
            print("DEBUG: GITHUB TOKEN LOADED SUCCESSFULLY")
        else:
            print("DEBUG: NO GITHUB TOKEN FOUND IN SETTINGS")
        
        print(f"DEBUG: GitHub fetching for sanitized username: '{self.username}'")

    def _sanitize_username(self, username):
        if not username:
            return ""
        # Handle cases where user might have saved a full URL
        # e.g., https://github.com/username or github.com/username
        clean = username.strip().rstrip('/')
        if 'github.com/' in clean:
            clean = clean.split('github.com/')[-1]
        elif 'github.com' in clean: # handles cases like github.com:username
             clean = clean.split('/')[-1]
        
        # Further clean up any query params or subpaths if someone pasted a repo link
        clean = clean.split('?')[0].split('/')[0]
        return clean

    def get_profile(self):
        res = self.get_profile_with_status()
        return res['data'] if res['status'] == 200 else None

    def get_profile_with_status(self):
        cache_key = f"github_profile_{self.username}"
        cached_data = cache.get(cache_key)
        if cached_data:
            return {'status': 200, 'data': cached_data}

        url = f"{self.BASE_URL}/users/{self.username}"
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            print(f"DEBUG: GitHub Response Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                cache.set(cache_key, data, 3600)
                return {'status': 200, 'data': data}
            
            print(f"DEBUG: GitHub Error Response: {response.text[:200]}")
            return {'status': response.status_code, 'data': None}
        except Exception as e:
            print(f"ERROR: GitHub profile fetch error: {str(e)}")
            return {'status': 500, 'data': None}

    def get_repositories(self):
        cache_key = f"github_repos_{self.username}"
        cached_data = cache.get(cache_key)
        if cached_data:
            return cached_data

        url = f"{self.BASE_URL}/users/{self.username}/repos"
        params = {
            "sort": "updated",
            "per_page": 100,
        }
        response = requests.get(url, headers=self.headers, params=params)
        
        if response.status_code == 200:
            data = response.json()
            cache.set(cache_key, data, 3600)
            return data
        return []

    def get_contribution_data(self):
        # GitHub's official API doesn't provide the heatmap directly.
        # Usually, people use GraphQL API or a library.
        # For now, we'll return a placeholder or use the events API to build a basic one.
        url = f"{self.BASE_URL}/users/{self.username}/events/public"
        response = requests.get(url, headers=self.headers)
        if response.status_code == 200:
            return response.json()
        return []
