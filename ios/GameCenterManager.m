//
//  GameCenterManager.m
//  Fortress
//
//  Created by Matthew Steedman on 12/11/15.
//  Copyright © 2015 Facebook. All rights reserved.
//

#import "GameCenterManager.h"
#import "AppDelegate.h"
#import "RCTBridge.h"
#import "RCTEventDispatcher.h"
@import GameKit;

@implementation GameCenterManager

@synthesize bridge = _bridge;

//int RCTLogInfo(NSString *message);

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(addEvent:(NSString *)name location:(NSString *)location)
{
  
  //TODO: Handle non-logged in players.
  NSLog(@"Pretending to create an event %@ at %@", name, location);
  UIViewController *rootController = (UIViewController*)[[(AppDelegate*)
                                    [[UIApplication sharedApplication]delegate] window] rootViewController];
  
  GKMatchRequest *request = [[GKMatchRequest alloc] init];
  request.minPlayers = 2;
  request.maxPlayers = 2;
  
  GKTurnBasedMatchmakerViewController *mmvc = [[GKTurnBasedMatchmakerViewController alloc] initWithMatchRequest:request];
  mmvc.turnBasedMatchmakerDelegate = self;
  
  [rootController presentViewController:mmvc animated:YES completion:nil];
}

#pragma mark GKTurnBasedMatchmakerViewControllerDelegate

- (void)turnBasedMatchmakerViewController:(GKTurnBasedMatchmakerViewController *)viewController didFindMatch:(GKTurnBasedMatch *)match
{
  NSLog(@"didFindMatch");
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
