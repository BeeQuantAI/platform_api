export const displayNamePatten = /^([a-zA-Z0-9-_]{4,15})?$/;
export const passwordPatten =
  /^(?=.*[A-Za-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*_+=\\~<>:;”’(),./[\]_`|{}-])[A-Za-z0-9#?!@$%^&*_+=\\~<>:;”’(),./[\]_`|{}-]{8,32}$/;
export const emailPattern =
  /^[\w-]+(\.[\w-]+)*@([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*?\.[a-zA-Z]{2,6}|(\d{1,3}\.){3}\d{1,3})(:\d{4})?$/;
