import client from "../api/client";

export async function getCurrentUser() {
  const response = await client.get("users/me/");
  return response.data;
}

export async function updateCurrentUser(data) {
  const response = await client.patch("users/me/", data);
  return response.data;
}

export async function getLeaderboard() {
  const response = await client.get("users/leaderboard/");
  return response.data;
}

export async function getDashboardAnalytics() {
  const response = await client.get("analytics/dashboard/");
  return response.data;
}

export async function getActivityHeatmap() {
  const response = await client.get("analytics/heatmap/");
  return response.data;
}

export async function getProjects() {
  const response = await client.get("projects/");
  return response.data;
}

export async function createProject(data) {
  const response = await client.post("projects/", data);
  return response.data;
}

export async function updateProject(id, data) {
  const response = await client.patch(`projects/${id}/`, data);
  return response.data;
}

export async function deleteProject(id) {
  const response = await client.delete(`projects/${id}/`);
  return response.data;
}

export async function getAvailableSkills() {
  const response = await client.get("skills/");
  return response.data;
}

export async function getUserSkills() {
  const response = await client.get("skills/my-skills/");
  return response.data;
}

export async function addUserSkill(data) {
  const response = await client.post("skills/my-skills/", data);
  return response.data;
}

export async function updateUserSkill(id, data) {
  const response = await client.patch(`skills/my-skills/${id}/`, data);
  return response.data;
}

export async function deleteUserSkill(id) {
  const response = await client.delete(`skills/my-skills/${id}/`);
  return response.data;
}

// GitHub Workspace APIs
export async function getGithubProfile() {
  const response = await client.get("github/profile/");
  return response.data;
}

export async function getGithubRepos() {
  const response = await client.get("github/repos/");
  return response.data;
}

export async function getGithubActivity() {
  const response = await client.get("github/activity/");
  return response.data;
}

export async function getActivityHub() {
  const response = await client.get("analytics/hub/");
  return response.data;
}

export async function setFeaturedBadge(badgeId) {
  const response = await client.post("analytics/badge/feature/", { badge_id: badgeId });
  return response.data;
}

export async function toggleShowcaseBadge(badgeId) {
  const response = await client.post("analytics/badge/toggle-showcase/", { badge_id: badgeId });
  return response.data;
}

export async function getPublicProfile(username) {
  const response = await client.get(`users/profile/${username}/`);
  return response.data;
}
