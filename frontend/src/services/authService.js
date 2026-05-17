import client from "../api/client";


export async function loginUser(data) {

  const response = await client.post(
    "auth/login/",
    data
  );

  return response.data;
}


export async function registerUser(data) {

  const response = await client.post(
    "auth/register/",
    data
  );

  return response.data;
}


export async function verifyOTP(data) {

  const response = await client.post(
    "auth/verify-otp/",
    data
  );

  return response.data;
}


export async function setPassword(data) {

  const response = await client.post(
    "auth/set-password/",
    data
  );

  return response.data;
}


export async function forgotPassword(data) {

  const response = await client.post(
    "auth/forgot-password/",
    data
  );

  return response.data;
}


export async function resetPassword(data) {

  const response = await client.post(
    "auth/reset-password/",
    data
  );

  return response.data;
}

export async function deleteAccount(password) {
  const response = await client.post("auth/delete-account/", { password });
  return response.data;
}

export async function resetAccountData(password) {
  const response = await client.post("auth/reset-data/", { password });
  return response.data;
}