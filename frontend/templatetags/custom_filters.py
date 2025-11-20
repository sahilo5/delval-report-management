from django import template

register = template.Library()

@register.filter
def getattribute(obj, attr):
    """
    Gets an attribute of an object dynamically from a string name
    """
    if hasattr(obj, attr):
        return getattr(obj, attr)
    elif isinstance(obj, dict) and attr in obj:
        return obj[attr]
    else:
        return None

@register.filter
def split(value, arg):
    """
    Splits a string by the given argument
    """
    return value.split(arg)