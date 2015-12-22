//
//  GameCenterViewController.m
//  Fortress
//
//  Created by Matthew Steedman on 12/11/15.
//  Copyright © 2015 Facebook. All rights reserved.
//

#import "GameCenterViewController.h"
#import "RCTBridge.h"
#import "RCTEventDispatcher.h"

@implementation GameCenterViewController

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(nothing:(NSString *)name location:(NSString *)location)
{
}

@synthesize bridge = _bridge;

+ (id)allocWithZone:(NSZone *)zone
{
  static GameCenterViewController *sharedInstance = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{ sharedInstance = [super allocWithZone:zone]; });
  return sharedInstance;
}

- (void)turnBasedMatchmakerViewController:(GKTurnBasedMatchmakerViewController *)viewController didFindMatch:(GKTurnBasedMatch *)match
{
  NSLog(@"didFindMatch");
  if (_bridge == nil) {
    NSLog(@"_bridge is nil");
  }
  NSDictionary *event = @{
  @"match": @{
      @"matchID": match.matchID,
      }
  };
  [self dismissViewControllerAnimated:YES completion:nil];
  //[self.bridge.eventDispatcher sendInputEventWithName:@"topChange" body:match];
  [_bridge.eventDispatcher sendAppEventWithName:@"EventReminder"
                                                  body:@{@"match": event}];
}

- (void)turnBasedMatchmakerViewController:(GKTurnBasedMatchmakerViewController *)viewController playerQuitForMatch:(GKTurnBasedMatch *)match
{
  NSLog(@"PlayerQuitForMatch");
  [self dismissViewControllerAnimated:YES completion:nil];
}

- (void)turnBasedMatchmakerViewController:(GKTurnBasedMatchmakerViewController *)viewController didFailWithError:(nonnull NSError *)error
{
  NSLog(@"didFailWithError");
  NSLog(@"%@", error);
  [self dismissViewControllerAnimated:YES completion:nil];
}

- (void)turnBasedMatchmakerViewControllerWasCancelled:(GKTurnBasedMatchmakerViewController *)viewController {
  NSLog(@"WasCancelled");
  [self dismissViewControllerAnimated:YES completion:nil];
}

@end
